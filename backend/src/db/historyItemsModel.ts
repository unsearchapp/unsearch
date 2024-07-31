import knex from "./db";
import { Knex } from "knex";

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
	sessionsIds: string[],
	query?: string
): Promise<HistoryItem[]> => {
	try {
		const knexQuery = knex("HistoryItems")
			.select()
			.where({ userId })
			.orderBy("lastVisitTime", "desc")
			.modify(function (builder: Knex.QueryBuilder) {
				if (sessionsIds.length > 0) {
					builder.whereIn("sessionId", sessionsIds);
				}
				if (query) {
					// builder.whereILike("title", `%${query}%`).orWhereILike("url", `%${query}%`);
					builder.where((qb: Knex.QueryBuilder) => {
						qb.whereILike("title", `%${query}%`).orWhereILike("url", `%${query}%`);
					});
				}
			});

		const historyItems: HistoryItem[] = await knexQuery;
		return historyItems;
	} catch (error) {
		throw error;
	}
};

export const fuzzyHistoryItemsSearch = async (
	userId: string,
	sessionsIds: string[],
	query?: string
): Promise<HistoryItem[]> => {
	try {
		const knexQuery = knex("HistoryItems")
			.select()
			.where({ userId })
			.modify(function (builder: Knex.QueryBuilder) {
				if (sessionsIds.length > 0) {
					builder.whereIn("sessionId", sessionsIds);
				}
			})
			.where(function () {
				this.whereRaw("GREATEST(word_similarity(title, ?), word_similarity(url, ?)) > ?", [
					query,
					query,
					0.3
				]).orWhere(function () {
					this.whereRaw("word_similarity(title, ?) = 0", [query]).orWhereRaw(
						"word_similarity(url, ?) = 0",
						[query]
					);
				});
			})
			.orderByRaw("GREATEST(word_similarity(title, ?), word_similarity(url, ?)) DESC", [
				query,
				query
			])
			.orderBy("lastVisitTime", "desc");

		const historyItems: HistoryItem[] = await knexQuery;
		return historyItems;
	} catch (error) {
		throw error;
	}
};

export const semanticHistoryItemsSearch = async (
	userId: string,
	sessionsIds: string[],
	wordsWithSimilarities: Map<string, number>
): Promise<HistoryItem[]> => {
	try {
		const knexQuery = knex("HistoryItems")
			.select()
			.where({ userId })
			.modify(function (builder: Knex.QueryBuilder) {
				if (sessionsIds.length > 0) {
					builder.whereIn("sessionId", sessionsIds);
				}
			})
			.andWhere((builder) => {
				wordsWithSimilarities.forEach((_, word) => {
					builder.orWhere("title", "like", `%${word}%`).orWhere("url", "like", `%${word}%`);
				});
			})
			.orderBy("lastVisitTime", "desc");

		const historyItems: HistoryItem[] = await knexQuery;

		// Calculate similarity and rank results
		const results = historyItems.map((item) => {
			const titleSimilarity = (item.title && wordsWithSimilarities.get(item.title)) || 0;
			const urlSimilarity = (item.url && wordsWithSimilarities.get(item.url)) || 0;
			const combinedSimilarity = (titleSimilarity + urlSimilarity) / 2;

			return { ...item, similarity: combinedSimilarity };
		});

		results.sort((a, b) => b.similarity - a.similarity);

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
