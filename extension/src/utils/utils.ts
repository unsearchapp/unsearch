import browser from "webextension-polyfill";

// Utility function to send a message and wait for a response
export const sendMessageToBackground = (port: browser.Runtime.Port, message: any): Promise<any> => {
	return new Promise((resolve, reject) => {
		// Listen for a single response from the background script
		const onResponse = (response: any) => {
			resolve(response);
			port.onMessage.removeListener(onResponse);
		};

		port.onMessage.addListener(onResponse);
		port.postMessage(message);

		// Optional: set a timeout to reject the promise if no response is received
		setTimeout(() => {
			reject(new Error("Timeout waiting for response from background script"));
			port.onMessage.removeListener(onResponse);
		}, 5000); // Adjust the timeout duration as needed
	});
};
