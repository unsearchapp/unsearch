import {
	AuthPayload,
	IdPayload,
	HistoryAddPayload,
	HistoryDeletePayload,
	BookmarksAddPayload,
	BookmarksDeletePayload,
	BookmarksUpdatePayload,
	BookmarksMovePayload,
	BookmarksTreeNodePayload,
	TabsAddPayload
} from "../models/payloads";
import { validate } from "uuid";

export const validateAuthPayload = (payload: any): payload is AuthPayload => {
	return typeof payload === "object" && payload !== null && typeof payload.token === "string";
};

export const validateIdPayload = (payload: any): payload is IdPayload => {
	return (
		typeof payload === "object" &&
		payload !== null &&
		typeof payload.id === "string" &&
		validate(payload.id) &&
		typeof payload.browser === "string"
	);
};

export const validateHistoryAddPyloadItem = (payload: any): payload is HistoryAddPayload => {
	const isValidDate = (date: number): boolean => !isNaN(date) && new Date(date).getTime() > 0;

	return (
		typeof payload === "object" &&
		payload !== null &&
		typeof payload.id === "string" &&
		(typeof payload.url === "undefined" || typeof payload.url === "string") &&
		(typeof payload.title === "undefined" ||
			payload.title === null ||
			typeof payload.title === "string") &&
		(typeof payload.lastVisitTime === "undefined" ||
			(typeof payload.lastVisitTime === "number" && isValidDate(payload.lastVisitTime))) &&
		(typeof payload.visitCount === "undefined" || typeof payload.visitCount === "number") &&
		(typeof payload.typedCount === "undefined" || typeof payload.typedCount === "number")
	);
};

export const validateHistoryAddPayload = (payloads: any[]): payloads is HistoryAddPayload[] => {
	if (!Array.isArray(payloads)) {
		return false;
	}
	return payloads.every(validateHistoryAddPyloadItem);
};

export const validateHistoryDeletePayload = (payload: any): payload is HistoryDeletePayload => {
	return (
		(typeof payload === "object" &&
			payload !== null &&
			typeof payload.allHistory === "boolean" &&
			typeof payload.urls === "undefined") ||
		(Array.isArray(payload.urls) && payload.urls.every((item: string) => typeof item === "string"))
	);
};

const validateBookmarksTreeNodePayload = (node: any): node is BookmarksTreeNodePayload => {
	return (
		typeof node === "object" &&
		node !== null &&
		(typeof node.dateAdded === "undefined" || typeof node.dateAdded === "number") &&
		(typeof node.dateGroupModified === "undefined" || typeof node.dateGroupModified === "number") &&
		(typeof node.dateLastUsed === "undefined" || typeof node.dateLastUsed === "number") &&
		typeof node.id === "string" &&
		(typeof node.index === "undefined" || typeof node.index === "number") &&
		(typeof node.parentId === "undefined" || typeof node.parentId === "string") &&
		typeof node.title === "string" &&
		(typeof node.url === "undefined" || typeof node.url === "string") &&
		(typeof node.children === "undefined" ||
			(Array.isArray(node.children) && node.children.every(validateBookmarksTreeNodePayload)))
	);
};

export const validateBookmarksAddPayload = (payload: any): payload is BookmarksAddPayload => {
	return (
		typeof payload === "object" &&
		payload !== null &&
		Array.isArray(payload.bookmarks) &&
		payload.bookmarks.every(validateBookmarksTreeNodePayload)
	);
};

export const validateBookmarksDeletePayload = (payload: any): payload is BookmarksDeletePayload => {
	return typeof payload === "object" && payload !== null && typeof payload.id === "string";
};

export const validateBookmarksUpdatePayload = (payload: any): payload is BookmarksUpdatePayload => {
	return (
		typeof payload === "object" &&
		payload !== null &&
		typeof payload.id === "string" &&
		typeof payload.updateInfo === "object" &&
		payload.updateInfo !== null &&
		typeof payload.updateInfo.title === "string" &&
		typeof payload.updateInfo.url === "string"
	);
};

export const validateBookmarksMovePayload = (payload: any): payload is BookmarksMovePayload => {
	return (
		typeof payload === "object" &&
		payload !== null &&
		typeof payload.id === "string" &&
		typeof payload.moveInfo === "object" &&
		payload.moveInfo !== null &&
		typeof payload.moveInfo.index === "string" &&
		typeof payload.moveInfo.oldIndex === "string" &&
		typeof payload.moveInfo.oldParentId === "string" &&
		typeof payload.moveInfo.parentId === "string"
	);
};

export const validateTabsAddPayload = (payload: any[]): payload is TabsAddPayload[] => {
	return (
		Array.isArray(payload) &&
		payload.every((item) => {
			return (
				typeof item === "object" &&
				item !== null &&
				typeof item.incognito === "boolean" &&
				typeof item.index === "number" &&
				typeof item.pinned === "boolean" &&
				typeof item.windowId === "number" &&
				(item.favIconUrl === undefined || typeof item.favIconUrl === "string") &&
				(item.id === undefined || typeof item.id === "number") &&
				(item.lastAccessed === undefined || typeof item.lastAccessed === "number") &&
				(item.openerTabId === undefined || typeof item.openerTabId === "number") &&
				(item.title === undefined || typeof item.title === "string") &&
				(item.url === undefined || typeof item.url === "string")
			);
		})
	);
};
