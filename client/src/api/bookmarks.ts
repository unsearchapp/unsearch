import { Bookmark, ApiResponse } from "../types/api";

export const getBookmarks = async (): Promise<Bookmark[]> => {
	const response = await fetch("/api/bookmarks", {
		credentials: "include"
	});
	const data: ApiResponse<Bookmark[]> = await response.json();
	return data.data;
};

export const updateBookmark = async (
	id: string,
	sessionId: string,
	title: string,
	url: string | undefined
): Promise<number> => {
	const response = await fetch("/api/bookmarks", {
		method: "POST",
		body: JSON.stringify({ id, sessionId, title, url }),
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		}
	});
	const data: ApiResponse<number> = await response.json();
	return data.data;
};

export const deleteBookmark = async (id: string, sessionId: string): Promise<number> => {
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
