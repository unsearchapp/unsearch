window.addEventListener("message", function (event) {
	if (event.source !== window) return;

	// Forward the message to the background script
	if (event.data.type && event.data.type === "signupSuccess") {
		browser.runtime.sendMessage({ type: "signupSuccess" });
	}
});
