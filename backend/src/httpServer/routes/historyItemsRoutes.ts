import { Router, Request, Response } from "express";
import {
	getHistoryItemsByUser,
	getUserHistoryForExport,
	fuzzyHistoryItemsSearch,
	deleteHistoryItems,
	semanticHistoryItemsSearch,
	HistoryItem
} from "../../db/historyItemsModel";
import { requireAuth } from "../middlewares/requireAuth";
import { sendMessageToUser } from "../../wsServer/wsServer";
import { logger } from "../../utils/logger";
import { getSessionsByUser } from "../../db/sessionsModel";

const router = Router();

router.get("/history-items", requireAuth, async (req, res) => {
	try {
		const pageSize = 25;
		const query = req.query.q as string;
		const page = req.query.page as string;
		const searchType = req.query.searchType as string;
		const rawSessions = req.query.s as string | undefined | string[];

		const offset = (Number(page) - 1) * pageSize;

		const arraySessions: string[] = Array.isArray(rawSessions)
			? rawSessions
			: rawSessions
				? [rawSessions]
				: [];

		let items: HistoryItem[] = [];
		let totalItems: number = 0;
		switch (searchType) {
			case "exact":
				({ items, totalItems } = await getHistoryItemsByUser(
					req.user!._id,
					arraySessions,
					pageSize,
					offset,
					query
				));
				break;

			case "fuzzy":
				({ items, totalItems } = await fuzzyHistoryItemsSearch(
					req.user!._id,
					arraySessions,
					pageSize,
					offset,
					query
				));
				break;

			case "semantic":
				if (query) {
					const response = await fetch(`${process.env.WORD2VEC_URL}/similarity?query=${query}`);
					const data = await response.json();

					// Extract words and their similarities
					const wordsWithSimilarities = new Map<string, number>();
					data.forEach(([word, similarity]: [string, number]) => {
						wordsWithSimilarities.set(word, similarity);
					});

					({ items, totalItems } = await semanticHistoryItemsSearch(
						req.user!._id,
						arraySessions,
						wordsWithSimilarities,
						pageSize,
						offset
					));
				} else {
					({ items, totalItems } = await getHistoryItemsByUser(
						req.user!._id,
						arraySessions,
						pageSize,
						offset,
						query
					)); // Fetch all history
				}

				break;
		}

		res.json({ data: { items, totalItems } });
	} catch (error) {
		logger.error(error, "Error in /history-items GET route");
		res.status(500).json({ data: { items: [], totalItems: 0 } });
	}
});

router.delete("/history-items", requireAuth, async (req, res) => {
	try {
		const ids = req.body.ids as string[];
		const all = req.body.all as boolean;

		const { itemsToDelete, deletedRows } = await deleteHistoryItems(req.user!._id, ids, all);

		// Send message to extension
		if (all) {
			const sessions = await getSessionsByUser(req.user!._id);
			sessions.forEach((session) => {
				const message = JSON.stringify({
					type: "HISTORY_REMOVE",
					payload: { url: "", all }
				});
				sendMessageToUser(req.user!._id, session._id, message);
			});
		} else {
			itemsToDelete.forEach((item) => {
				const message = JSON.stringify({
					type: "HISTORY_REMOVE",
					payload: { url: item.url }
				});
				sendMessageToUser(req.user!._id, item.sessionId, message);
			});
		}

		res.json({ data: deletedRows });
	} catch (error) {
		logger.error(error, "Error in /history-items delete route");
		res.status(500).json({ data: 0 });
	}
});

router.get("/history-items/export", requireAuth, async (req: Request, res: Response) => {
	try {
		const historyItems = await getUserHistoryForExport(req.user!._id);

		// Prepare CSV headers
		const headers = ["id", "title", "url", "lastVisitTime", "visitCount", "typedCount"];
		const csvRows: string[] = [];

		// Add headers to CSV rows
		csvRows.push(headers.join(","));

		// Add each history item to CSV rows
		historyItems.forEach((item) => {
			const row = [
				`"${item.id}"`,
				item.title ? `"${item.title.replace(/"/g, '""')}"` : "", // Escape quotes in title or empty if undefined
				item.url ? `"${item.url.replace(/"/g, '""')}"` : "", // Escape quotes in URL or empty if undefined
				item.lastVisitTime ? `"${item.lastVisitTime.toISOString()}"` : "", // Convert date to ISO string or empty if undefined
				item.visitCount !== undefined ? `"${item.visitCount}"` : "", // Convert visitCount to string or empty if undefined
				item.typedCount !== undefined ? `"${item.typedCount}"` : "" // Convert typedCount to string or empty if undefined
			];
			csvRows.push(row.join(","));
		});

		// Join all rows with newline characters
		const csvData = csvRows.join("\n");

		// Set headers and send response
		res.header("Content-Type", "text/csv");
		res.attachment("historyItems.csv");
		res.send(csvData);
	} catch (error) {
		logger.error(error, "Error in /history-items/export GET route");
		res.status(500).json({ error });
	}
});

export default router;
