import {
	BookmarkInsert,
	createBookmarks,
	deleteBookmarkById,
	moveBookmark,
	updateBookmark,
	setBookmarkId
} from "../../db/bookmarksModel";
import {
	BookmarkNodePayload,
	BookmarksAddPayload,
	BookmarksTreeNodePayload,
	BookmarksDeletePayload,
	BookmarksMovePayload,
	BookmarksUpdatePayload,
	BookmarksSetIdPayload
} from "../models/payloads";

function transformPayloadtoBookmark(
	node: BookmarkNodePayload,
	userId: string,
	sessionId: string
): BookmarkInsert {
	return {
		userId: userId,
		sessionId: sessionId,
		dateAdded: node.dateAdded ? new Date(node.dateAdded) : undefined,
		dateGroupModified: node.dateGroupModified ? new Date(node.dateGroupModified) : undefined,
		dateLastUsed: node.dateLastUsed ? new Date(node.dateLastUsed) : undefined,
		id: node.id,
		index: node.index,
		parentId: node.parentId,
		title: node.title,
		url: node.url
	};
}

export const collectBookmarks = (
	tree: BookmarksTreeNodePayload[],
	userId: string,
	sessionId: string,
	bookmarks: BookmarkInsert[] = []
): BookmarkInsert[] => {
	for (const node of tree) {
		const transformedNode: BookmarkInsert = transformPayloadtoBookmark(node, userId, sessionId);
		bookmarks.push(transformedNode);

		if (node.children && node.children.length > 0) {
			collectBookmarks(node.children, userId, sessionId, bookmarks);
		}
	}
	return bookmarks;
};

export const storeBookmarkTree = async (
	tree: BookmarksTreeNodePayload[],
	userId: string,
	sessionId: string
) => {
	const bookmarks = await collectBookmarks(tree, userId, sessionId);
	if (bookmarks.length > 0) {
		await createBookmarks(bookmarks); // Bulk insert
	}
};

export const bookmarksAddHandler = async (
	payload: BookmarksAddPayload,
	userId: string,
	sessionId: string
) => {
	await storeBookmarkTree(payload.bookmarks, userId, sessionId);
};

export const bookmarksDeleteHandler = async (
	payload: BookmarksDeletePayload,
	userId: string,
	sessionId: string
) => {
	await deleteBookmarkById(payload.id, userId, sessionId);
};

export const bookmarksMoveHandler = async (
	payload: BookmarksMovePayload,
	userId: string,
	sessionId: string
) => {
	await moveBookmark(
		payload.id,
		userId,
		sessionId,
		payload.moveInfo.index,
		payload.moveInfo.parentId
	);
};

export const bookmarksUpdateHandler = async (
	payload: BookmarksUpdatePayload,
	userId: string,
	sessionId: string
) => {
	await updateBookmark(
		payload.id,
		userId,
		sessionId,
		payload.updateInfo.url,
		payload.updateInfo.title
	);
};

export const bookmarksSetIdHandler = async (payload: BookmarksSetIdPayload) => {
	await setBookmarkId(payload._id, payload.id);
};
