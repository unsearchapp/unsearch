import { v4 as uuidv4 } from "uuid";
import { Bookmark, ApiResponse } from "../types/api";

export const getBookmarks = async (): Promise<Bookmark[]> => {
	const response = await fetch("/api/bookmarks", {
		credentials: "include"
	});
	const data: ApiResponse<Bookmark[]> = await response.json();
	return data.data;
};

export const createBookmark = async (
	parentId: string,
	sessionId: string,
	title: string,
	index?: number,
	url?: string
): Promise<boolean> => {
	// Create a temporal id
	const tempId = uuidv4();

	const response = await fetch("/api/bookmarks", {
		method: "POST",
		body: JSON.stringify({ sessionId, index, parentId, title, url, id: tempId }),
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		}
	});
	const data: ApiResponse<boolean> = await response.json();
	return data.data;
};

export const updateBookmark = async (
	id: string,
	sessionId: string,
	title: string,
	url: string | undefined
): Promise<number> => {
	const response = await fetch("/api/bookmarks", {
		method: "PATCH",
		body: JSON.stringify({ id, sessionId, title, url }),
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		}
	});
	const data: ApiResponse<number> = await response.json();
	return data.data;
};

export const moveBookmark = async (
	id: string,
	sessionId: string,
	index: number,
	parentId: string
): Promise<number> => {
	const response = await fetch("/api/bookmarks/move", {
		method: "POST",
		body: JSON.stringify({ id, sessionId, index, parentId }),
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
