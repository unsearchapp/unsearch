import { TabsAddPayload } from "../models/payloads";
import { TabInsert, createTabs } from "../../db/tabsModel";

function transformPayloadToTabInsert(
	payload: TabsAddPayload,
	userId: string,
	sessionId: string,
	date: string
): TabInsert {
	return {
		userId: userId,
		sessionId: sessionId,
		date: date,
		favIconUrl: payload.favIconUrl,
		id: payload.id,
		incognito: payload.incognito,
		index: payload.index,
		lastAccessed: payload.lastAccessed ? new Date(payload.lastAccessed) : undefined,
		openerTabId: payload.openerTabId,
		pinned: payload.pinned,
		title: payload.title,
		url: payload.url,
		windowId: payload.windowId
	};
}

export const addTabsHandler = (payload: TabsAddPayload[], userId: string, sessionId: string) => {
	const snapshotDate = new Date().toISOString();

	const tabs = payload.map((tab) =>
		transformPayloadToTabInsert(tab, userId, sessionId, snapshotDate)
	);

	createTabs(tabs);
};
