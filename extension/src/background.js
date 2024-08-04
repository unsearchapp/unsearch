if (typeof importScripts === "function") {
	importScripts("browser-polyfill.js");
}

const BROWSER = "chrome";
const ongoingOperations = new Set();

const checkAuth = async () => {
	try {
		const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/checkAuth`, {
			method: "GET",
			credentials: "include"
		});

		if (response.ok) {
			const data = await response.json();
			browser.storage.local.set({ isLoggedIn: true, user: data.user });
		} else {
			browser.storage.local.set({ isLoggedIn: false, user: null });
		}
	} catch (error) {
		browser.storage.local.set({ isLoggedIn: false, user: null });
	}
};

checkAuth();

// Check auth every 30sec
setInterval(checkAuth, 30000);

// Listen for messages from content script
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.type === "signupSuccess") {
		browser.storage.local.set({ isLoggedIn: true }).then(() => {
			checkAndRecoverUID();
		});
	}
});

browser.history.onVisited.addListener(function (historyItem) {
	if (signed) {
		const message = JSON.stringify({
			type: "HISTORY_ADD",
			payload: [historyItem]
		});
		webSocket.send(message);
	}
});

browser.bookmarks.onCreated.addListener(function (id, bookmark) {
	if (signed) {
		if (ongoingOperations.has(bookmark.title)) {
			// Bookmark is created in the webapp
			ongoingOperations.delete(bookmark.title);
		} else {
			// Bookmark is created in the browser
			const payload = { bookmarks: [bookmark] };
			const message = JSON.stringify({ type: "BOOKMARKS_ADD", payload: payload });
			webSocket.send(message);
		}
	}
});

browser.bookmarks.onMoved.addListener(function (id, moveInfo) {
	if (signed) {
		const payload = { id, moveInfo };
		const message = JSON.stringify({
			type: "BOOKMARKS_MOVE",
			payload: payload
		});
		webSocket.send(message);
	}
});

browser.bookmarks.onChanged.addListener(function (id, changeInfo) {
	if (signed) {
		const payload = { id, updateInfo: changeInfo };
		const message = JSON.stringify({
			type: "BOOKMARKS_UPDATE",
			payload: payload
		});
		webSocket.send(message);
	}
});

browser.bookmarks.onRemoved.addListener(function (id, removedInfo) {
	if (signed) {
		const payload = { id };
		const message = JSON.stringify({ type: "BOOKMARKS_DELETE", payload });
		webSocket.send(message);
	}
});

browser.history.onVisitRemoved.addListener(function (removed) {
	if (signed) {
		if (removed.allHistory) {
			const message = JSON.stringify({
				type: "HISTORY_DELETE",
				payload: removed
			});
			webSocket.send(message);
		} else if (removed.urls.length === 0) {
			// If a visit is removed but there are more records for that same url
		} else {
			// url is removed completely from history
			const message = JSON.stringify({
				type: "HISTORY_DELETE",
				payload: removed
			});
			webSocket.send(message);
		}
	}
});

function syncData(data) {
	// Remove decimals from timestamp in milliseconds
	const updatedData = data.map((item) => {
		return {
			...item,
			lastVisitTime: Math.floor(item.lastVisitTime)
		};
	});

	const message = { type: "HISTORY_ADD", payload: updatedData };
	webSocket.send(JSON.stringify(message));
}

function fetchHistory(text, startTime, endTime, indices) {
	browser.history.search({ text, startTime, endTime }).then((items) => {
		// let firstSearch = searchItems[0]
		// browser.history.getVisits({url: firstSearch.url},
		// (visitItems) => {
		//   console.log(visitItems)
		// });

		let searchItems = [];
		items.forEach((item) => {
			if (!indices.includes(item.id)) {
				searchItems.push(item);
				indices.push(item.id);
			}
		});

		if (searchItems.length > 0) {
			syncData(searchItems);
		}

		let lastVisitTime = searchItems.reduce(
			(earliest, item) => Math.min(earliest, item.lastVisitTime),
			Number.MAX_SAFE_INTEGER
		);

		if (searchItems.length > 0 && (endTime === undefined || lastVisitTime < endTime)) {
			setTimeout(fetchHistory(text, startTime, lastVisitTime, indices), 1000);
		}
	});
}

function keepAlive() {
	const keepAliveIntervalId = setInterval(
		() => {
			if (webSocket) {
				webSocket.send(JSON.stringify({ type: "PING", payload: { message: "ping" } }));
			} else {
				clearInterval(keepAliveIntervalId);
			}
		},
		// Set the interval to 20 seconds to prevent the service worker from becoming inactive.
		20 * 1000
	);
}

function fetchBookmarks() {
	browser.bookmarks.getTree().then((results) => {
		if (signed) {
			const payload = { bookmarks: results };
			const message = JSON.stringify({
				type: "BOOKMARKS_ADD",
				payload: payload
			});
			webSocket.send(message);
		}
	});
}

let webSocket = null;
let signed = false;
function connect(sessionId, token) {
	webSocket = new WebSocket(import.meta.env.VITE_WS_URL);

	webSocket.onopen = (event) => {
		const payload = { token: token };
		const message = JSON.stringify({ type: "AUTH", payload });
		webSocket.send(message);

		keepAlive();
	};

	webSocket.onmessage = (event) => {
		try {
			const { type, payload } = JSON.parse(event.data);

			switch (type) {
				case "AUTH_SUCCESS":
					chrome.runtime.getPlatformInfo().then((data) => {
						const message = JSON.stringify({
							type: "ID",
							payload: { id: sessionId, browser: BROWSER, arch: data.arch, os: data.os }
						});
						webSocket.send(message);
					});

					break;

				case "ID_SUCCESS":
					signed = true;
					break;

				case "HISTORY_INIT":
					fetchBookmarks();
					fetchHistory("", 0, undefined, []);
					break;

				case "SESSION_REMOVE":
					signed = false;
					disconnect();
					break;

				case "BOOKMARKS_REMOVE": {
					const id = payload.id;
					browser.bookmarks.remove(id); // remove bookmark / empty folder
					break;
				}

				case "BOOKMARKS_UPDATE": {
					const id = payload.id;
					const changes = payload.changes;

					browser.bookmarks.update(id, changes);
					break;
				}

				case "BOOKMARKS_MOVE": {
					const id = payload.id;
					const destination = payload.destination;
					browser.bookmarks.move(id, destination);
					break;
				}

				case "BOOKMARKS_CREATE": {
					const { _id, createDetails } = payload;

					ongoingOperations.add(createDetails.title);

					browser.bookmarks.create(createDetails).then((bookmark) => {
						const message = JSON.stringify({
							type: "BOOKMARKS_SETID",
							payload: { _id, id: bookmark.id }
						});
						webSocket.send(message);
					});
					break;
				}

				case "HISTORY_REMOVE":
					const url = payload.url;
					browser.history.deleteUrl({ url }); // see also deleteRange
					break;

				default:
					console.log("Unexpected event received: ", type, event);
			}
		} catch (error) {
			console.log("Error parsing the message", event.data, error);
		}
	};

	webSocket.onclose = (event) => {
		console.log("websocket connection closed");
		webSocket = null;
	};
}

function disconnect() {
	if (webSocket == null) {
		return;
	}
	webSocket.close();
}

function saveUID(uid) {
	browser.storage.local.set({ uid });
}

function getOrCreateUUID(callback) {
	browser.storage.local.get("uid").then((result) => {
		if (result.uid) {
			callback(result.uid);
		} else {
			const newId = crypto.randomUUID();
			saveUID(newId);
			callback(newId);
		}
	});
}

function setUp(sessionId) {
	fetch(`${import.meta.env.VITE_BACKEND_URL}/api/token`, { credentials: "include" })
		.then((response) => response.json())
		.then((data) => {
			if (data.token) {
				connect(sessionId, data.token);
			}
		})
		.catch((error) => console.log(error));
}

function checkAndRecoverUID() {
	getOrCreateUUID(function (id) {
		sessionId = id;
		setUp(sessionId);
	});
}

browser.runtime.onInstalled.addListener(checkAndRecoverUID);
browser.runtime.onStartup.addListener(checkAndRecoverUID);

let tabsMapping = {};

function formatTabObject(rawTab) {
	return {
		favIconUrl: rawTab.favIconUrl,
		id: rawTab.id,
		incognito: rawTab.incognito,
		index: rawTab.index,
		lastAccessed: rawTab.lastAccessed,
		openerTabId: rawTab.openerTabId,
		pinned: rawTab.pinned,
		title: rawTab.title,
		url: rawTab.url,
		windowId: rawTab.windowId
	};
}

function snapshotTabState() {
	if (signed) {
		browser.tabs.query({}).then((rawTabs) => {
			const tabs = rawTabs
				.filter((rawTab) => !isExcludedUrl(rawTab.url))
				.map((rawTab) => formatTabObject(rawTab));

			const message = JSON.stringify({ type: "TABS_ADD", payload: tabs });
			webSocket.send(message);
		});
	}
}

const excludedUrls = [
	"about:newTab",
	"about:blank",
	"chrome://newtab/",
	"chrome://blank/",
	"edge://newtab/",
	"edge://blank/"
];

function isExcludedUrl(url) {
	return excludedUrls.some((excludedUrl) => url.startsWith(excludedUrl));
}

function initialCaptureTabsState() {
	if (signed) {
		browser.tabs.query({}).then((rawTabs) => {
			const tabs = rawTabs
				.filter((rawTab) => !isExcludedUrl(rawTab.url))
				.map((rawTab) => formatTabObject(rawTab));

			for (const tab of tabs) {
				tabsMapping[tab.id] = tab.url;
			}

			const message = JSON.stringify({ type: "TABS_ADD", payload: tabs });
			webSocket.send(message);
		});
	}
}

function onTabUpdate(tabId, changeInfo, tab) {
	if (
		tab.status === "complete" &&
		tab.url &&
		tab.title &&
		tab.favIconUrl &&
		tabsMapping[tab.id] !== tab.url
	) {
		tabsMapping[tab.id] = tab.url;
		snapshotTabState();
	}
}

function onTabDelete(tabId, removeInfo) {
	delete tabsMapping[tabId];
	snapshotTabState();
}

initialCaptureTabsState();

browser.tabs.onAttached.addListener(snapshotTabState);
browser.tabs.onDetached.addListener(snapshotTabState);
browser.tabs.onUpdated.addListener(onTabUpdate);
