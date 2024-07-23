import knex from "./db";

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

export const createBookmark = async (bookmark: BookmarkInsert) => {
	try {
		await knex("Bookmarks").insert(bookmark).onConflict(["userId", "sessionId", "id"]).ignore();
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

export const updateBookmark = async (
	id: string,
	userId: string,
	sessionId: string,
	url: string,
	title: string
) => {
	try {
		await knex("Bookmarks").where({ id, userId, sessionId }).update({ title, url });
	} catch (error) {
		throw error;
	}
};

export const moveBookmark = async (
	id: string,
	userId: string,
	sessionId: string,
	index: string,
	parentId: string
) => {
	try {
		await knex("Bookmarks").where({ id, userId, sessionId }).update({ index, parentId });
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
