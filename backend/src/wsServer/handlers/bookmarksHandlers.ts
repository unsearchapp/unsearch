import {
	BookmarkInsert,
	createBookmark,
	deleteBookmarkById,
	moveBookmark,
	updateBookmark
} from "../../db/bookmarksModel";
import {
	BookmarkNodePayload,
	BookmarksAddPayload,
	BookmarksTreeNodePayload,
	BookmarksDeletePayload,
	BookmarksMovePayload,
	BookmarksUpdatePayload
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

export const storeBookmarkTree = async (
	tree: BookmarksTreeNodePayload[],
	userId: string,
	sessionId: string
) => {
	for (const node of tree) {
		const transformedNode: BookmarkInsert = transformPayloadtoBookmark(node, userId, sessionId);
		await createBookmark(transformedNode);

		if (node.children && node.children.length > 0) {
			await storeBookmarkTree(node.children, userId, sessionId);
		}
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
