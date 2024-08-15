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

const router = Router();

router.get("/history-items", requireAuth, async (req, res) => {
	try {
		const query = req.query.q as string;
		const searchType = req.query.searchType as string;
		const rawSessions = req.query.s as string | undefined | string[];

		const arraySessions: string[] = Array.isArray(rawSessions)
			? rawSessions
			: rawSessions
				? [rawSessions]
				: [];

		let historyItems: HistoryItem[] = [];
		switch (searchType) {
			case "exact":
				historyItems = await getHistoryItemsByUser(req.user!._id, arraySessions, query);
				break;

			case "fuzzy":
				historyItems = await fuzzyHistoryItemsSearch(req.user!._id, arraySessions, query);
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

					historyItems = await semanticHistoryItemsSearch(
						req.user!._id,
						arraySessions,
						wordsWithSimilarities
					);
				} else {
					historyItems = await getHistoryItemsByUser(req.user!._id, arraySessions, query); // Fetch all history
				}

				break;
		}

		res.json({ data: historyItems });
	} catch (error) {
		logger.error(error, "Error in /history-items GET route");
		res.status(500).json({ error });
	}
});

router.delete("/history-items", requireAuth, async (req, res) => {
	try {
		const ids = req.body.ids as string[];

		const { itemsToDelete, deletedRows } = await deleteHistoryItems(req.user!._id, ids);

		// Send message to extension
		itemsToDelete.forEach((item) => {
			const message = JSON.stringify({
				type: "HISTORY_REMOVE",
				payload: { url: item.url }
			});
			sendMessageToUser(req.user!._id, item.sessionId, message);
		});

		res.json({ data: deletedRows });
	} catch (error) {
		logger.error(error, "Error in /history-items delete route");
		res.status(500).json({ error });
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
