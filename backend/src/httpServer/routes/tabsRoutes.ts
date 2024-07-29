import { Router } from "express";
import { Tab, deleteTab, getTabsByUser } from "../../db/tabsModel";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../../utils/logger";

const router = Router();

router.get("/tabs", requireAuth, async (req, res) => {
	try {
		const userId = req.user!._id;
		const pageSize = 10;
		const lastDate = req.query.lastDate as string;
		const limit = pageSize + 1;

		// Fetch initial set of tabs
		let tabs: Tab[] = await getTabsByUser(userId, lastDate as string, limit);

		// Check if there are more tabs
		const hasMore = tabs.length > Number(pageSize);
		if (hasMore) {
			tabs.pop(); // Remove the extra item used to check for more data

			// Fetch additional tabs to include all tabs with the same date
			const lastItemDate = tabs[tabs.length - 1].date;
			const additionalTabs: Tab[] = await getTabsByUser(userId, lastItemDate, Number(pageSize) + 1);

			// Combine initial tabs with additional tabs
			tabs.push(
				...additionalTabs.filter((item) => !tabs.some((existing) => existing.id === item.id))
			);
		}

		// Track the last date of fetched tabs
		const newLastDate = tabs.length > 0 ? tabs[tabs.length - 1].date : null;

		// Group tabs by date and windowId
		const groupedData = tabs.reduce((acc: any, row: any) => {
			if (!acc[row.date]) {
				acc[row.date] = {};
			}
			if (!acc[row.date][row.windowId]) {
				acc[row.date][row.windowId] = [];
			}
			acc[row.date][row.windowId] = acc[row.date][row.windowId].concat(row.records);
			return acc;
		}, {});

		res.json({
			data: groupedData,
			hasMore,
			lastDate: newLastDate,
			len: tabs.length
		});
	} catch (error) {
		logger.error(error, "Error in /tabs GET route");
		res.status(500).json({ error });
	}
});

router.delete("/tabs", requireAuth, async (req, res) => {
	try {
		const _id = req.body._id as string;

		const rowsDeleted: number = await deleteTab(req.user!._id, _id);
		
		res.json({ data: rowsDeleted });
	} catch (error) {
		logger.error("Error in /tabs DELETE route");
		res.status(500).json({ data: 0 });
	}
});

export default router;
