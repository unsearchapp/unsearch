import { HistoryItem, ApiResponse } from "../types/api";

export const getHistoryItems = async (
	query: string,
	searchType: string
): Promise<HistoryItem[]> => {
	const response = await fetch(`/api/history-items?q=${query}&searchType=${searchType}`, {
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
