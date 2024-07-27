import { HistoryAddPayload } from "../models/payloads";
import { HistoryItemInsert, createHistoryItems } from "../../db/historyItemsModel";

function transformPayloadToHistoryItem(
	historyAddItem: HistoryAddPayload,
	userId: string,
	sessionId: string
): HistoryItemInsert {
	return {
		userId,
		sessionId,
		id: historyAddItem.id,
		url: historyAddItem.url,
		title: historyAddItem.title || "",
		lastVisitTime: historyAddItem.lastVisitTime
			? new Date(historyAddItem.lastVisitTime)
			: undefined,
		visitCount: historyAddItem.visitCount,
		typedCount: historyAddItem.typedCount
	};
}

export const historyAddHandler = async (
	payload: HistoryAddPayload[],
	userId: string,
	sessionId: string
) => {
	const historyItems = payload.map((historyItem) =>
		transformPayloadToHistoryItem(historyItem, userId, sessionId)
	);
	
	createHistoryItems(historyItems);
};
