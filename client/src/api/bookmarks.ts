import { Bookmark, ApiResponse } from "../types/api";

export const getBookmarks = async (): Promise<Bookmark[]> => {
	const response = await fetch("/api/bookmarks", {
		credentials: "include"
	});
	const data: ApiResponse<Bookmark[]> = await response.json();
	return data.data;
};

export const deleteBookmark = async (id: string, sessionId: string): Promise<number> => {
	console.log({ id, sessionId });
	const response = await fetch("/api/bookmarks", {
		method: "DELETE",
		body: JSON.stringify({ id, sessionId }),
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		}
	});
	const data: ApiResponse<number> = await response.json();
	return data.data;
};
