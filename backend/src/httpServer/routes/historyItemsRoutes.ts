import { Router } from "express";
import {
	getHistoryItemsByUser,
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

		let historyItems: HistoryItem[] = [];
		switch (searchType) {
			case "exact":
				historyItems = await getHistoryItemsByUser(req.user!._id, query);
				break;

			case "fuzzy":
				historyItems = await fuzzyHistoryItemsSearch(req.user!._id, query);
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

					historyItems = await semanticHistoryItemsSearch(req.user!._id, wordsWithSimilarities);
				} else {
					historyItems = await getHistoryItemsByUser(req.user!._id, query); // Fetch all history
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

export default router;
