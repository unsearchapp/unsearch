import { useState, useEffect } from "react";
import { Home } from "./Views/Home";
import { Welcome } from "./Views/Welcome";
import browser from "webextension-polyfill";

function App() {
	const [view, setView] = useState<"welcome" | "home">("welcome");

	useEffect(() => {
		const checkAuthStatus = async () => {
			const result = await browser.storage.local.get("isLoggedIn");
			const isLoggedIn = result.isLoggedIn || false;
			setView(isLoggedIn ? "home" : "welcome");
		};

		checkAuthStatus();
	}, []);

	return (
		<>
			{view === "welcome" && <Welcome />}
			{view === "home" && <Home />}
		</>
	);
}

export default App;
