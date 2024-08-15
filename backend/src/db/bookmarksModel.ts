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

export const setBookmarkId = async (_id: string, id: string) => {
	try {
		await knex("Bookmarks").where({ _id }).update({ id });
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
