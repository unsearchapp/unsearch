import ws from "ws";
import { MessageType } from "./models/messageTypes";
import {
	validateAuthPayload,
	validateIdPayload,
	validateHistoryAddPayload,
	validateBookmarksAddPayload,
	validateHistoryDeletePayload,
	validateBookmarksDeletePayload,
	validateBookmarksMovePayload,
	validateBookmarksUpdatePayload,
	validateBookmarksSetIdPayload,
	validateTabsAddPayload
} from "./utils/validatePayloads";
import { validateToken } from "./utils/validateToken";
import { idHandler } from "./handlers/idHandler";
import { historyAddHandler } from "./handlers/historyAddHandler";
import {
	bookmarksAddHandler,
	bookmarksDeleteHandler,
	bookmarksMoveHandler,
	bookmarksUpdateHandler,
	bookmarksSetIdHandler
} from "./handlers/bookmarksHandlers";
import { historyDeleteHandler } from "./handlers/historyDeleteHandler";
import { UserConnection } from "./models/wsServer";
import { Session } from "../db/sessionsModel";
import {
	Message,
	handlePendingMessage,
	getPendingMessagesBySession,
	updateMessageStatus
} from "../db/messagesModel";
import { logger } from "../utils/logger";
import { addTabsHandler } from "./handlers/tabsHandlers";
import { throttleFunction } from "./utils/throttleFunction";
import { updateSessionLastConnectedDate } from "../db/sessionsModel";

const port = process.env.WS_PORT;
if (!port) {
	logger.error("WS_PORT enviroment variable is missing");
	throw new Error("WS_PORT enviroment variable is missing");
}

const wss = new ws.WebSocketServer({ port: parseInt(port) });

export const usersConnections: Map<string, UserConnection> = new Map();

export const sendMessageToUser = async (
	userId: string,
	sessionId: string,
	type: string,
	payload: any,
	messageId?: string // Optional messageId to track the pending message
) => {
	const userConnection = usersConnections.get(sessionId);
	const message = JSON.stringify({ type, payload });

	if (userConnection) {
		// User is connected, send the message
		try {
			userConnection.ws.send(message);
			// If there's a messageId provided, mark it as sent
			if (messageId) {
				await updateMessageStatus(messageId);
			}
		} catch (error) {
			logger.error(error, "Error sending to user session");
			// If sending fails, add to the message queue
			if (!messageId) {
				// Pending message is already in db
				await handlePendingMessage(userId, sessionId, type, payload);
			}
		}
	} else {
		if (!messageId) {
			// Pending message is already in db
			await handlePendingMessage(userId, sessionId, type, payload);
		}
	}
};

export const closeSession = async (sessionId: string) => {
	const userConnection = usersConnections.get(sessionId);
	if (userConnection) {
		// Check if the WebSocket connection is open
		if (userConnection.ws.readyState === ws.OPEN) {
			// Close the WebSocket connection
			userConnection.ws.close();
		}
	}
};

// Throttle function to update session connected date to ensure it is called at most once every 30s per connection
const throttledUpdateSessionLastConnectedDate = throttleFunction(
	updateSessionLastConnectedDate,
	30000
);

wss.on("connection", (ws: any, req: any) => {
	let userId: string | null = null;
	let sessionId: string | null = null;

	ws.on("error", (error: Error) => {
		logger.error(error, "WebSocket connection error");
	});

	ws.on("close", () => {
		if (userId && sessionId) {
			usersConnections.delete(sessionId);
		}
	});

	ws.on("message", async (message: string) => {
		try {
			if (sessionId) {
				throttledUpdateSessionLastConnectedDate.call(ws, sessionId, new Date());
			}

			const { type, payload } = JSON.parse(message);

			switch (type) {
				case MessageType.AUTH:
					if (validateAuthPayload(payload)) {
						const result = validateToken(payload.token);

						if (result) {
							userId = result.userId;
							ws.send(JSON.stringify({ type: "AUTH_SUCCESS" }));
						}
					} else {
						logger.info("Invalid AUTH payload");
					}
					break;

				case MessageType.ID:
					if (!userId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateIdPayload(payload)) {
							try {
								const session: Session = await idHandler(payload, userId);

								sessionId = session._id;
								usersConnections.set(sessionId, { ws }); // Save user connection
								ws.send(JSON.stringify({ type: "ID_SUCCESS" }));

								// Handle pending messages
								try {
									const messages: Message[] = await getPendingMessagesBySession(sessionId);
									for (const msg of messages) {
										const message = JSON.stringify({
											type: msg.msg_type,
											payload: msg.msg_payload
										});
										ws.send(message);
										await updateMessageStatus(msg._id);
									}
								} catch (error) {}

								ws.send(JSON.stringify({ type: "HISTORY_INIT" })); // Check if session has previous data
							} catch (error) {
								logger.error(error, "Error handling ID message");
								ws.send(JSON.stringify({ type: "ERROR" }));
							}
						} else {
							logger.info("Invalid ID payload");
						}
					}
					break;

				case MessageType.HISTORY_ADD:
					if (!userId || !sessionId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateHistoryAddPayload(payload)) {
							try {
								await historyAddHandler(payload, userId, sessionId);
							} catch (error) {
								logger.error(error, "Error in history add handler");
								ws.send(JSON.stringify({ type: "ERROR" }));
							}
						} else {
							logger.info("Invalid history add payload");
						}
					}

					break;

				case MessageType.HISTORY_DELETE:
					if (!userId || !sessionId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateHistoryDeletePayload(payload)) {
							try {
								await historyDeleteHandler(payload, userId, sessionId);
							} catch (error) {
								logger.error(error, "Error in history delete handler");
								ws.send(JSON.stringify({ type: "ERROR" }));
							}
						} else {
							logger.info("Invalid history delete payload");
						}
					}
					break;

				case MessageType.BOOKMARKS_ADD:
					if (!userId || !sessionId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateBookmarksAddPayload(payload)) {
							try {
								await bookmarksAddHandler(payload, userId, sessionId);
							} catch (error) {
								logger.error(error, "Error in bookmarks add handler");
								ws.send(JSON.stringify({ type: "ERROR" }));
							}
						} else {
							logger.info("Invalid bookmarks add payload");
						}
					}
					break;

				case MessageType.BOOKMARKS_DELETE:
					if (!userId || !sessionId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateBookmarksDeletePayload(payload)) {
							try {
								await bookmarksDeleteHandler(payload, userId, sessionId);
							} catch (error) {
								logger.error(error, "Error in bookmarks delete handler");
								ws.send(JSON.stringify({ type: "ERROR" }));
							}
						} else {
							logger.info("Invalid bookmarks delete payload");
						}
					}
					break;

				case MessageType.BOOKMARKS_MOVE:
					if (!userId || !sessionId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateBookmarksMovePayload(payload)) {
							try {
								await bookmarksMoveHandler(payload, userId, sessionId);
							} catch (error) {
								logger.error(error, "Error in bookmarks move handler");
								ws.send(JSON.stringify({ type: "ERROR" }));
							}
						} else {
							logger.info("Invalid bookmarks move payload");
						}
					}
					break;

				case MessageType.BOOKMARKS_UPDATE:
					if (!userId || !sessionId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateBookmarksUpdatePayload(payload)) {
							try {
								await bookmarksUpdateHandler(payload, userId, sessionId);
							} catch (error) {
								logger.error(error, "Error in bookmarks update handler");
								ws.send(JSON.stringify({ type: "ERROR" }));
							}
						} else {
							logger.info("Invalid bookmarks update payload");
						}
					}
					break;

				case MessageType.BOOKMARKS_SETID:
					logger.debug(payload, "New BOOKMARKS_SETID message.");
					if (!userId || !sessionId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateBookmarksSetIdPayload(payload)) {
							try {
								await bookmarksSetIdHandler(payload);
							} catch (error) {
								logger.error(error, "Error in bookmarks setid handler");
								ws.send(JSON.stringify({ type: "ERROR" }));
							}
						} else {
							logger.info("Invalid bookmarks setid payload");
						}
					}
					break;

				case MessageType.TABS_ADD:
					if (!userId || !sessionId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateTabsAddPayload(payload)) {
							try {
								await addTabsHandler(payload, userId, sessionId);
							} catch (error) {
								logger.error(error, "Error in tabs add handler");
								ws.send(JSON.stringify({ type: "ERROR" }));
							}
						} else {
							logger.info("Invalid tabs add payload");
						}
					}
					break;

				case MessageType.PING:
					break;

				default:
					logger.info("Unexpected message");
			}
		} catch (error) {
			logger.error("Error parsing the message", error);
		}
	});
});

export default { wss, port };
