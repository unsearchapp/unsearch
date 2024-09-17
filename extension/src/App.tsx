import { useState, useEffect } from "react";
import { Home } from "./Views/Home";
import { Welcome } from "./Views/Welcome";
import { Settings } from "./Views/Settings";
import browser from "webextension-polyfill";

function App() {
	const [view, setView] = useState<"welcome" | "settings" | "home">("welcome");
	const [port, setPort] = useState<browser.Runtime.Port | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [email, setEmail] = useState<string>("");
	const [dashboardUrl, setDashboardUrl] = useState<string>("");
	const [host, setHost] = useState<string>("");

	useEffect(() => {
		const getUser = async () => {
			const result = await browser.storage.local.get("user");
			const user = result.user || {};
			setEmail(user.email || "");
		};

		const checkAuthStatus = async () => {
			const result = await browser.storage.local.get("isLoggedIn");

			const isLoggedIn = result.isLoggedIn || false;
			if (isLoggedIn) {
				await getUser();
			}
			setView(isLoggedIn ? "home" : "welcome");
		};

		checkAuthStatus();

		const newPort = browser.runtime.connect({ name: "popup" });
		setPort(newPort);

		newPort.onMessage.addListener((msg) => {
			if (msg.type === "SESSION_STATUS") {
				setIsConnected(msg.isConnected);
			}
		});

		// Optional: Request the current status when the popup loads
		newPort.postMessage({ type: "GET_STATUS" });

		return () => {
			newPort.disconnect();
		};
	}, []);

	return (
		<>
			{view === "welcome" && (
				<Welcome
					setView={setView}
					port={port}
					url={dashboardUrl}
					setUrl={setDashboardUrl}
					setHost={setHost}
				/>
			)}
			{view === "settings" && (
				<Settings setView={setView} port={port} host={host} setHost={setHost} />
			)}
			{view === "home" && <Home email={email} isConnected={isConnected} port={port} />}
		</>
	);
}

export default App;
