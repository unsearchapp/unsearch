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

export type PublicHistoryItem = Omit<HistoryItem, "_id" | "userId" | "sessionId">;

export const getHistoryItemsByUser = async (
	userId: string,
	sessionsIds: string[],
	pageSize: number,
	offset: number,
	query?: string
): Promise<{ items: HistoryItem[]; totalItems: number }> => {
	try {
		const baseQuery = knex("HistoryItems")
			.select()
			.where({ userId })
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

		// Query to fetch paginated items
		const itemsQuery = baseQuery
			.clone() // Clone the base query to avoid modifying it
			.select()
			.orderBy("lastVisitTime", "desc")
			.limit(pageSize)
			.offset(offset);

		// Query to fetch total number of items
		const countQuery = baseQuery
			.clone() // Clone the base query again
			.count({ total: "*" })
			.first(); // .first() to get a single object with the count

		// Execute both queries in parallel
		const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

		// Extract the total count from the result
		const totalItems = totalResult?.total ? parseInt(totalResult.total, 10) : 0;

		// Return both items and total count
		return {
			items,
			totalItems
		};
	} catch (error) {
		throw error;
	}
};

export const getUserHistoryForExport = async (userId: string): Promise<PublicHistoryItem[]> => {
	try {
		const columns: string[] = ["id", "url", "title", "lastVisitTime", "visitCount", "typedCount"];

		const knexQuery = knex("HistoryItems")
			.select(columns)
			.where({ userId })
			.orderBy("lastVisitTime", "desc");

		const historyItems: HistoryItem[] = await knexQuery;
		return historyItems;
	} catch (error) {
		throw error;
	}
};

export const fuzzyHistoryItemsSearch = async (
	userId: string,
	sessionsIds: string[],
	pageSize: number,
	offset: number,
	query?: string
): Promise<{ items: HistoryItem[]; totalItems: number }> => {
	try {
		const baseQuery = knex("HistoryItems")
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
			});

		// Query to fetch paginated items
		const itemsQuery = baseQuery
			.clone()
			.orderByRaw("GREATEST(word_similarity(title, ?), word_similarity(url, ?)) DESC", [
				query,
				query
			])
			.orderBy("lastVisitTime", "desc")
			.limit(pageSize)
			.offset(offset);

		// Query to fetch total number of items
		const countQuery = baseQuery.clone().count({ total: "*" }).first(); // .first() to get a single object with the count

		// Execute both queries in parallel
		const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

		// Extract the total count from the result
		const totalItems = totalResult?.total ? parseInt(totalResult.total, 10) : 0;

		// Return both items and total count
		return {
			items,
			totalItems
		};
	} catch (error) {
		throw error;
	}
};

export const semanticHistoryItemsSearch = async (
	userId: string,
	sessionsIds: string[],
	wordsWithSimilarities: Map<string, number>,
	pageSize: number,
	offset: number
): Promise<{ items: HistoryItem[]; totalItems: number }> => {
	try {
		const baseQuery = knex("HistoryItems")
			.select()
			.where({ userId })
			.modify((builder: Knex.QueryBuilder) => {
				if (sessionsIds.length > 0) {
					builder.whereIn("sessionId", sessionsIds);
				}
			})
			.andWhere((builder) => {
				wordsWithSimilarities.forEach((_, word) => {
					builder.orWhere("title", "like", `%${word}%`).orWhere("url", "like", `%${word}%`);
				});
			});

		// Query to fetch paginated items
		const itemsQuery = baseQuery
			.clone()
			.orderBy("lastVisitTime", "desc")
			.limit(pageSize)
			.offset(offset);

		// Query to fetch total number of items
		const countQuery = baseQuery.clone().count({ total: "*" }).first(); // .first() to get a single object with the count

		// Execute both queries in parallel
		const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

		// Extract the total count from the result
		const totalItems = totalResult?.total ? parseInt(totalResult.total.toString(), 10) : 0;

		// Calculate similarity and rank results
		const results = (items as HistoryItem[]).map((item) => {
			const titleSimilarity = item.title ? wordsWithSimilarities.get(item.title) || 0 : 0;
			const urlSimilarity = item.url ? wordsWithSimilarities.get(item.url) || 0 : 0;
			const combinedSimilarity = (titleSimilarity + urlSimilarity) / 2;

			return { ...item, similarity: combinedSimilarity };
		});

		// Sort the results by similarity in descending order
		results.sort((a, b) => b.similarity! - a.similarity!);

		// Return both items (sorted by similarity) and total count
		return {
			items: results,
			totalItems
		};
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
	ids: string[],
	all: boolean
): Promise<deleteHistoryResults> => {
	let itemsToDelete: Array<{ sessionId: string; url: string }> = [];
	let deletedRows: number = 0;

	const transaction = await knex.transaction();

	try {
		if (all) {
			// Delete all items for the given userId
			deletedRows = await transaction("HistoryItems").where({ userId }).del();
		} else {
			itemsToDelete = await transaction("HistoryItems")
				.where({ userId })
				.whereIn("_id", ids)
				.select("sessionId", "url");

			deletedRows = await transaction("HistoryItems").where({ userId }).whereIn("_id", ids).del();
		}
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
