import { knex, encryptionKey } from "./db";
import { logger } from "../utils/logger";

export interface Tab {
	_id: string;
	userId: string;
	sessionId: string;
	date: string;
	favIconUrl?: string;
	id?: number;
	incognito: boolean;
	index: number;
	lastAccessed?: Date;
	openerTabId?: number;
	pinned: boolean;
	title?: string;
	url?: string;
	windowId: number;
}

export type TabInsert = Omit<Tab, "_id">;

export const createTabs = async (tabs: TabInsert[]) => {
	try {
		const encryptedTabs = tabs.map((tab) => ({
			...tab,
			title: tab.title ? knex.raw("pgp_sym_encrypt(?, ?)", [tab.title, encryptionKey]) : null,
			url: tab.url ? knex.raw("pgp_sym_encrypt(?, ?)", [tab.url, encryptionKey]) : null,
			favIconUrl: tab.favIconUrl
				? knex.raw("pgp_sym_encrypt(?, ?)", [tab.favIconUrl, encryptionKey])
				: null
		}));

		await knex("Tabs").insert(encryptedTabs);
	} catch (error) {
		logger.error(error, "Error storing tabs");
		throw error;
	}
};

export const getTabsByUser = async (userId: string, lastDate: string, limit: number) => {
	try {
		let query = knex("Tabs")
			.select("date", "windowId", knex.raw("JSON_AGG(row_to_json(t.*)) AS records"))
			.from(
				knex("Tabs")
					.select(
						"_id",
						"userId",
						"sessionId",
						"date",
						"id",
						"incognito",
						"index",
						"lastAccessed",
						"openerTabId",
						"pinned",
						"windowId",
						knex.raw("pgp_sym_decrypt(title::bytea, ?) AS title", [encryptionKey]),
						knex.raw("pgp_sym_decrypt(url::bytea, ?) AS url", [encryptionKey]),
						knex.raw('pgp_sym_decrypt("favIconUrl"::bytea, ?) AS "favIconUrl"', [encryptionKey])
					)
					.as("t")
			)
			.where({ userId })
			.orderBy("date", "desc")
			.groupBy("date", "windowId")
			.limit(limit);

		if (lastDate) {
			query = query.andWhere("date", "<=", lastDate);
		}

		const tabs: Tab[] = await query;

		return tabs;
	} catch (error) {
		logger.error(error, "Error retrieving tabs by session");
		throw error;
	}
};

export const deleteTab = async (userId: string, _id: string): Promise<number> => {
	try {
		const deletedRows: number = await knex("Tabs").where({ userId, _id }).del();
		return deletedRows;
	} catch (error) {
		throw error;
	}
};
