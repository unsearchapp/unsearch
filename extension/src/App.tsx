import { useState, useEffect } from "react";
import { Home } from "./Views/Home";
import { Welcome } from "./Views/Welcome";
import browser from "webextension-polyfill";

function App() {
	const [view, setView] = useState<"welcome" | "home">("welcome");
	const [email, setEmail] = useState<string>("");

	useEffect(() => {
		const getUser = async () => {
			const result = await browser.storage.local.get("user");
			const user = result.user || {};
			setEmail(user.email || {});
		};

		const checkAuthStatus = async () => {
			const result = await browser.storage.local.get("isLoggedIn");

			const isLoggedIn = result.isLoggedIn || false;
			if (isLoggedIn) {
				getUser();
			}
			setView(isLoggedIn ? "home" : "welcome");
		};

		checkAuthStatus();
	}, []);

	return (
		<>
			{view === "welcome" && <Welcome />}
			{view === "home" && <Home email={email} />}
		</>
	);
}

export default App;
