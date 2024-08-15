import { HistoryResponse, ApiResponse } from "../types/api";

export const getHistoryItems = async (
	query: string,
	searchType: string,
	selectedSessions: string[],
	page: number
): Promise<HistoryResponse> => {
	const params = new URLSearchParams({
		q: query,
		searchType: searchType,
		page: page.toString()
	});

	// Add each item in the array as a separate query parameter
	selectedSessions.forEach((item) => params.append("s", item));

	// Construct the query string
	const queryString = params.toString();

	const response = await fetch(`/api/history-items?${queryString}`, {
		credentials: "include"
	});
	const data: ApiResponse<HistoryResponse> = await response.json();
	return data.data;
};

export const deleteHistoryItems = async (all: boolean, ids: string[]): Promise<number> => {
	const response = await fetch("/api/history-items", {
		method: "DELETE",
		credentials: "include",
		body: JSON.stringify({ all, ids }),
		headers: {
			"Content-Type": "application/json"
		}
	});
	const data: ApiResponse<number> = await response.json();
	return data.data;
};

export const exportHistoryItems = async () => {
	const response = await fetch("/api/history-items/export", {
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		}
	});

	if (!response.ok) {
		throw new Error("Error during history export");
	}

	const blob = await response.blob();
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "history.csv";
	document.body.appendChild(a);
	a.click();
	a.remove();
};
