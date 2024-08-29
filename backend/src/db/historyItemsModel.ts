import { knex, encryptionKey } from "./db";
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
			.select(
				"_id",
				"userId",
				"sessionId",
				"id",
				knex.raw("pgp_sym_decrypt(title::bytea, ?) as title", [encryptionKey]),
				knex.raw("pgp_sym_decrypt(url::bytea, ?) as url", [encryptionKey]),
				"lastVisitTime",
				"visitCount",
				"typedCount"
			)
			.where({ userId })
			.modify(function (builder: Knex.QueryBuilder) {
				if (sessionsIds.length > 0) {
					builder.whereIn("sessionId", sessionsIds);
				}
				if (query) {
					// Update the search to decrypt and search on the decrypted fields
					builder.where((qb: Knex.QueryBuilder) => {
						qb.where(
							knex.raw("pgp_sym_decrypt(title::bytea, ?) ILIKE ?", [encryptionKey, `%${query}%`])
						).orWhere(
							knex.raw("pgp_sym_decrypt(url::bytea, ?) ILIKE ?", [encryptionKey, `%${query}%`])
						);
					});
				}
			});

		// Query to fetch paginated items
		const itemsQuery = baseQuery
			.clone() // Clone the base query to avoid modifying it
			// .select()
			.orderBy("lastVisitTime", "desc")
			.limit(pageSize)
			.offset(offset);

		// Query to fetch total number of items
		const countQuery = baseQuery
			.clone() // Clone the base query again
			.clearSelect()
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
		const knexQuery = knex("HistoryItems")
			.select(
				"id",
				knex.raw("pgp_sym_decrypt(title::bytea, ?) as title", [encryptionKey]),
				knex.raw("pgp_sym_decrypt(url::bytea, ?) as url", [encryptionKey]),
				"lastVisitTime",
				"visitCount",
				"typedCount"
			)
			.where({ userId })
			.orderBy("lastVisitTime", "desc");

		const historyItems: PublicHistoryItem[] = await knexQuery;
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
			.select(
				"_id",
				"userId",
				"sessionId",
				"id",
				knex.raw("pgp_sym_decrypt(title::bytea, ?) as title", [encryptionKey]),
				knex.raw("pgp_sym_decrypt(url::bytea, ?) as url", [encryptionKey]),
				"lastVisitTime",
				"visitCount",
				"typedCount"
			)
			.where({ userId })
			.modify(function (builder: Knex.QueryBuilder) {
				if (sessionsIds.length > 0) {
					builder.whereIn("sessionId", sessionsIds);
				}
			})
			.where(function () {
				this.whereRaw(
					"GREATEST(word_similarity(pgp_sym_decrypt(title::bytea, ?), ?), word_similarity(pgp_sym_decrypt(url::bytea, ?), ?)) > ?",
					[encryptionKey, query, encryptionKey, query, 0.3]
				).orWhere(function () {
					this.whereRaw("word_similarity(pgp_sym_decrypt(title::bytea, ?), ?) = 0", [
						encryptionKey,
						query
					]).orWhereRaw("word_similarity(pgp_sym_decrypt(url::bytea, ?), ?) = 0", [
						encryptionKey,
						query
					]);
				});
			});

		// Query to fetch paginated items
		const itemsQuery = baseQuery
			.clone()
			.orderByRaw(
				"GREATEST(word_similarity(pgp_sym_decrypt(title::bytea, ?), ?), word_similarity(pgp_sym_decrypt(url::bytea, ?), ?)) DESC",
				[encryptionKey, query, encryptionKey, query]
			)
			.orderBy("lastVisitTime", "desc")
			.limit(pageSize)
			.offset(offset);

		// Query to fetch total number of items
		const countQuery = baseQuery.clone().clearSelect().clear("order").count({ total: "*" }).first(); // .first() to get a single object with the count

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
			.select(
				"_id",
				"userId",
				"sessionId",
				"id",
				knex.raw("pgp_sym_decrypt(title::bytea, ?) as title", [encryptionKey]),
				knex.raw("pgp_sym_decrypt(url::bytea, ?) as url", [encryptionKey]),
				"lastVisitTime",
				"visitCount",
				"typedCount"
			)
			.where({ userId })
			.modify((builder: Knex.QueryBuilder) => {
				if (sessionsIds.length > 0) {
					builder.whereIn("sessionId", sessionsIds);
				}
			})
			.andWhere((builder) => {
				wordsWithSimilarities.forEach((_, word) => {
					builder
						.orWhereRaw("pgp_sym_decrypt(title::bytea, ?) ILIKE ?", [encryptionKey, `%${word}%`])
						.orWhereRaw("pgp_sym_decrypt(url::bytea, ?) ILIKE ?", [encryptionKey, `%${word}%`]);
				});
			});

		// Query to fetch paginated items
		const itemsQuery = baseQuery
			.clone()
			.orderBy("lastVisitTime", "desc")
			.limit(pageSize)
			.offset(offset);

		// Query to fetch total number of items
		const countQuery = baseQuery.clone().clearSelect().clear("order").count({ total: "*" }).first(); // to get a single object with the count

		// Execute both queries in parallel
		const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

		// Extract the total count from the result
		const totalItems = totalResult?.total ? parseInt(totalResult.total.toString(), 10) : 0;

		// Calculate similarity
		const results = (items as HistoryItem[]).map((item) => {
			const titleSimilarity = item.title
				? Array.from(wordsWithSimilarities.entries()).reduce((acc, [word, similarity]) => {
						if (item.title!.includes(word)) acc += similarity;
						return acc;
					}, 0)
				: 0;

			const urlSimilarity = item.url
				? Array.from(wordsWithSimilarities.entries()).reduce((acc, [word, similarity]) => {
						if (item.url!.includes(word)) acc += similarity;
						return acc;
					}, 0)
				: 0;

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
			.select(
				"_id",
				"userId",
				"sessionId",
				"id",
				knex.raw("pgp_sym_decrypt(title::bytea, ?) as title", [encryptionKey]),
				knex.raw("pgp_sym_decrypt(url::bytea, ?) as url", [encryptionKey]),
				"lastVisitTime",
				"visitCount",
				"typedCount"
			)
			.where({ userId, sessionId });
		return historyItems;
	} catch (error) {
		throw error;
	}
};

export const createHistoryItems = async (historyItems: HistoryItemInsert[]) => {
	try {
		const encryptedHistoryItems = historyItems.map((item) => ({
			...item,
			title: item.title ? knex.raw("pgp_sym_encrypt(?, ?)", [item.title, encryptionKey]) : null,
			url: item.url ? knex.raw("pgp_sym_encrypt(?, ?)", [item.url, encryptionKey]) : null
		}));
		await knex("HistoryItems").insert(encryptedHistoryItems);
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
				.select("sessionId", knex.raw("pgp_sym_decrypt(url::bytea, ?) AS url", [encryptionKey]));

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
		// Encrypt each URL in the 'urls' array using the encryption key
		const encryptedUrls = urls.map((url) =>
			knex.raw("pgp_sym_encrypt(?, ?)", [url, encryptionKey])
		);

		const deletedRows: number = await knex("HistoryItems")
			.where({ userId, sessionId })
			.whereIn("url", encryptedUrls)
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
