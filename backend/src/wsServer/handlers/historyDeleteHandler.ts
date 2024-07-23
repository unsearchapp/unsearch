import { HistoryDeletePayload } from "../models/payloads";
import { deleteHistoryUrls, deleteAllHistory } from "../../db/historyItemsModel";

export const historyDeleteHandler = async (
	payload: HistoryDeletePayload,
	userId: string,
	sessionId: string
) => {
	if (payload.allHistory) {
		await deleteAllHistory(userId, sessionId);
	} else if (payload.urls) {
		await deleteHistoryUrls(userId, sessionId, payload.urls);
	}
};
