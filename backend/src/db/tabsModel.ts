import knex from "./db";
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
		await knex("Tabs").insert(tabs);
	} catch (error) {
		logger.error(error, "Error storing tabs");
		throw error;
	}
};

export const getTabsByUser = async (userId: string, lastDate: string, limit: number) => {
	try {
		let query = knex("Tabs")
			.select("date", "windowId", knex.raw('JSON_AGG(row_to_json("Tabs")) AS records'))
			.where({ userId })
			.orderBy("date", "desc")
			.groupBy("date", "windowId")
			.limit(limit);

		if (lastDate) {
			query = query.andWhere("date", "<=", lastDate);
		}

		return await query;
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
