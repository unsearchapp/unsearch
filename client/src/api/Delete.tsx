function deleteItems(historyItems: String[]) {
	console.log("Deleting items: ", historyItems);

	const sendDataToMainProcess = () => {
		(window as any).electronAPI.sendToMain("toMain", { key: "value" });
	};

	const receiveDataFromMainProcess = () => {
		(window as any).electronAPI.receiveFromMain("fromMain", (data: any) => {
			console.log("Data received from main process:", data);
		});
	};

	receiveDataFromMainProcess();
	sendDataToMainProcess();
}

export default deleteItems;
