import knex from "./db";
import { sendMessageToUser } from "../wsServer/wsServer";

export interface Bookmark {
	_id: string;
	userId: string;
	sessionId: string;
	dateAdded?: Date;
	dateGroupModified?: Date;
	dateLastUsed?: Date;
	id: string;
	index?: number;
	parentId?: string;
	title: string;
	url?: string;
}

export type BookmarkInsert = Omit<Bookmark, "_id">;
export type PublicBookmark = Omit<Bookmark, "userId">;

export interface BookmarkTreeNode {
	children?: BookmarkTreeNode[];
	dateAdded?: Date;
	dateGroupModified?: Date;
	dateLastUsed?: Date;
	id: string;
	index?: number;
	parentId?: string;
	title: string;
	url?: string;
}

interface insertedBookmark {
	_id: string;
}

export const createBookmark = async (bookmark: BookmarkInsert): Promise<string> => {
	try {
		const [{ _id }]: insertedBookmark[] = await knex("Bookmarks").insert(bookmark).returning("_id");
		return _id;
	} catch (error) {
		throw error;
	}
};

export const getBookmarksByUser = async (userId: string): Promise<PublicBookmark[]> => {
	try {
		const columns: string[] = [
			"_id",
			"sessionId",
			"dateAdded",
			"dateGroupModified",
			"dateLastUsed",
			"id",
			"index",
			"parentId",
			"title",
			"url"
		];
		const bookmarks: PublicBookmark[] = await knex("Bookmarks").select(columns).where({ userId });
		return bookmarks;
	} catch (error) {
		throw error;
	}
};

export const getBookmarksBySession = async (
	userId: string,
	sessionId: string
): Promise<PublicBookmark[]> => {
	try {
		const columns: string[] = [
			"_id",
			"sessionId",
			"dateAdded",
			"dateGroupModified",
			"dateLastUsed",
			"id",
			"index",
			"parentId",
			"title",
			"url"
		];
		const bookmarks: PublicBookmark[] = await knex("Bookmarks")
			.select(columns)
			.where({ userId, sessionId });
		return bookmarks;
	} catch (error) {
		throw error;
	}
};

interface UpdateFields {
	title?: string;
	url?: string;
}

// Uses bookmark id and sessionId to identify a bookmark, used for incoming messages from extensions
export const updateBookmark = async (
	id: string,
	userId: string,
	sessionId: string,
	url: string | undefined,
	title: string | undefined
): Promise<number> => {
	try {
		const updateData: UpdateFields = {};
		if (title !== undefined) {
			updateData.title = title;
		}
		if (url !== undefined) {
			updateData.url = url;
		}

		// Ensure there's at least one field to update
		if (Object.keys(updateData).length > 0) {
			const rowsUpdated: number = await knex("Bookmarks")
				.where({ id, userId, sessionId })
				.update({ title, url });
			return rowsUpdated;
		}
		return 0;
	} catch (error) {
		throw error;
	}
};

// Uses database _id to identify a bookmark, used for changes made from webapp
export const updateBookmarkById = async (
	_id: string,
	userId: string,
	url?: string,
	title?: string
): Promise<{ updatedId: string | null; rowsUpdated: number }> => {
	try {
		const updateData: UpdateFields = {};
		if (title !== undefined) {
			updateData.title = title;
		}
		if (url !== undefined) {
			updateData.url = url;
		}

		let rowsUpdated = 0;
		let updatedId: string | null = null;

		// Ensure there's at least one field to update
		if (Object.keys(updateData).length > 0) {
			// Update the database entry and return the id of the updated item
			const result = await knex("Bookmarks")
				.where({ _id, userId })
				.update(updateData)
				.returning("id");

			// The result will contain the array of updated IDs, so we pick the first one
			if (result.length > 0) {
				updatedId = result[0].id;
				rowsUpdated = result.length;
			}
		}

		return { updatedId, rowsUpdated };
	} catch (error) {
		throw error;
	}
};

export const moveBookmark = async (
	id: string,
	userId: string,
	sessionId: string,
	index: number,
	parentId: string
): Promise<number> => {
	try {
		const updatedRows = await knex("Bookmarks")
			.where({ id, userId, sessionId })
			.update({ index, parentId });
		return updatedRows;
	} catch (error) {
		throw error;
	}
};

const handlePendingMessages = async (previousId: string, newId: string) => {
	try {
		// Handle pending BOOKMARKS_MOVE messages
		const moveMessages = await knex("Messages")
			.select()
			.whereRaw(`(msg_payload->'destination'->>'parentId')::text = ?`, [previousId])
			.andWhere({ status: "pending", msg_type: "BOOKMARKS_MOVE" });

		for (const msg of moveMessages) {
			const updatedPayload = {
				...msg.msg_payload,
				destination: {
					...msg.msg_payload.destination,
					parentId: newId // Update parentId to final ID
				}
			};

			// Update message payload with final parent ID
			await knex("Messages").update({ msg_payload: updatedPayload }).where({ _id: msg._id });

			// Send the updated BOOKMARKS_MOVE message
			await sendMessageToUser(msg.userId, msg.sessionId, msg.msg_type, updatedPayload, msg._id);
		}

		// Handle pending BOOKMARKS_CREATE messages
		const createMessages = await knex("Messages")
			.select()
			.whereRaw(`(msg_payload->'createDetails'->>'parentId')::text = ?`, [previousId])
			.andWhere({ status: "pending", msg_type: "BOOKMARKS_CREATE" });

		for (const msg of createMessages) {
			const updatedPayload = {
				...msg.msg_payload,
				createDetails: {
					...msg.msg_payload.createDetails,
					parentId: newId // Update parentId to final ID
				}
			};

			// Update message payload with final parent ID
			await knex("Messages").update({ msg_payload: updatedPayload }).where({ _id: msg._id });

			// Send the updated BOOKMARKS_CREATE message
			await sendMessageToUser(msg.userId, msg.sessionId, msg.msg_type, updatedPayload, msg._id);
		}
	} catch (error) {
		throw error;
	}
};

export const setBookmarkId = async (_id: string, newId: string) => {
	try {
		// Start the transaction
		const previousId = await knex.transaction(async (trx) => {
			// Retrieve the current (old) ID
			const bookmark = await trx("Bookmarks").where({ _id }).first();
			if (!bookmark) {
				throw new Error(`Bookmark with _id: ${_id} not found`);
			}
			const previousId = bookmark.id;

			// Temporarily update child bookmarks to nullify parentId to avoid constraint issues
			await trx("Bookmarks").where({ parentId: previousId }).update({ parentId: null });

			// Update the bookmark with the new final ID
			await trx("Bookmarks").where({ _id }).update({ id: newId });

			// Now update the parentId of the child bookmarks to the new ID
			await trx("Bookmarks")
				.where({ parentId: null, userId: bookmark.userId, sessionId: bookmark.sessionId })
				.update({ parentId: newId });

			return previousId;
		});
		// Handle pending messages after the transaction
		await handlePendingMessages(previousId, newId);
	} catch (error) {
		throw error;
	}
};

export const deleteBookmarkById = async (
	id: string,
	userId: string,
	sessionId: string
): Promise<number> => {
	try {
		const deletedRows: number = await knex("Bookmarks").where({ userId, sessionId, id }).del();
		return deletedRows;
	} catch (error) {
		throw error;
	}
};
