import { HistoryItem, ApiResponse } from "../types/api";

export const getHistoryItems = async (
	query: string,
	searchType: string,
	selectedSessions: string[]
): Promise<HistoryItem[]> => {
	const params = new URLSearchParams({
		q: query,
		searchType: searchType
	});

	// Add each item in the array as a separate query parameter
	selectedSessions.forEach((item) => params.append("s", item));

	// Construct the query string
	const queryString = params.toString();

	const response = await fetch(`/api/history-items?${queryString}`, {
		credentials: "include"
	});
	const data: ApiResponse<HistoryItem[]> = await response.json();
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
