import { Router } from "express";
import { getMessagesByUser } from "../../db/messagesModel";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../../utils/logger";

const router = Router();

router.get("/logs", requireAuth, async (req, res) => {
	try {
		const pageSize = 25;
		const page = req.query.page as string;
		const offset = (Number(page) - 1) * pageSize;

		const messages = await getMessagesByUser(req.user!._id, pageSize, offset);
		const hasMore = messages.length === pageSize;

		res.json({ data: messages, hasMoreItems: hasMore, len: messages.length });
	} catch (error) {
		logger.error(error, "Error in /logs GET route");
		res.status(500).json({ error });
	}
});

export default router;
