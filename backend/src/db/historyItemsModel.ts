import knex from "./db";

export interface HistoryItem {
	_id: string;
	userId: string;
	sessionId: string;
	id: string;
	url?: string;
	title?: string;
	lastVisitTime?: Date;
	visitCount?: number;
	typedCount?: number;
}

export type HistoryItemInsert = Omit<HistoryItem, "_id">;

export const getHistoryItemsByUser = async (
	userId: string,
	query?: string
): Promise<HistoryItem[]> => {
	try {
		const knexQuery = knex("HistoryItems")
			.select()
			.where({ userId })
			.orderBy("lastVisitTime", "desc")
			.modify(function (builder: any) {
				if (query) {
					builder.whereILike("title", `${query}%`).orWhereILike("url", `${query}%`);
				}
			});

		const historyItems: HistoryItem[] = await knexQuery;
		return historyItems;
	} catch (error) {
		throw error;
	}
};

export const getHistoryItemsBySession = async (
	userId: string,
	sessionId: string
): Promise<HistoryItem[]> => {
	try {
		const historyItems: HistoryItem[] = await knex("HistoryItems")
			.select()
			.where({ userId, sessionId });
		return historyItems;
	} catch (error) {
		throw error;
	}
};

export const createHistoryItems = async (historyItems: HistoryItemInsert[]) => {
	try {
		await knex("HistoryItems").insert(historyItems);
	} catch (error) {
		throw error;
	}
};

export interface deleteHistoryResults {
	itemsToDelete: {
		sessionId: string;
		url: string;
	}[];
	deletedRows: number;
}

export const deleteHistoryItems = async (
	userId: string,
	ids: string[]
): Promise<deleteHistoryResults> => {
	const transaction = await knex.transaction();

	try {
		const itemsToDelete = await transaction("HistoryItems")
			.where({ userId })
			.whereIn("_id", ids)
			.select("sessionId", "url");

		const deletedRows: number = await transaction("HistoryItems")
			.where({ userId })
			.whereIn("_id", ids)
			.del();

		// Commit the transaction
		await transaction.commit();

		return { itemsToDelete, deletedRows };
	} catch (error) {
		throw error;
	}
};

export const deleteHistoryUrls = async (
	userId: string,
	sessionId: string,
	urls: string[]
): Promise<number> => {
	try {
		const deletedRows: number = await knex("HistoryItems")
			.where({ userId, sessionId })
			.whereIn("url", urls)
			.del();
		return deletedRows;
	} catch (error) {
		throw error;
	}
};

export const deleteAllHistory = async (userId: string, sessionId: string): Promise<number> => {
	try {
		const deletedRows: number = await knex("HistoryItems").where({ userId, sessionId }).del();
		return deletedRows;
	} catch (error) {
		throw error;
	}
};
