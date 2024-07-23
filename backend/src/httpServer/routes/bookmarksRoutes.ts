import { Router, Request, Response } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { getBookmarksByUser, deleteBookmarkById } from "../../db/bookmarksModel";
import { sendMessageToUser } from "../../wsServer/wsServer";

const router = Router();

router.get("/bookmarks", requireAuth, async (req: Request, res: Response) => {
	try {
		const bookmarks = await getBookmarksByUser(req.user!._id);
		res.json({ data: bookmarks });
	} catch (error) {
		res.status(500).json({ error });
	}
});

router.delete("/bookmarks", requireAuth, async (req, res) => {
	try {
		const sessionId = req.body.sessionId as string;
		const id = req.body.id as string;

		const rowsDeleted: number = await deleteBookmarkById(id, req.user!._id, sessionId);

		// send message to extension
		const message = JSON.stringify({ type: "BOOKMARKS_REMOVE", payload: { id } });
		sendMessageToUser(req.user!._id, sessionId, message);

		res.json({ data: rowsDeleted });
	} catch (error) {
		res.status(500).json({ error });
	}
});

export default router;
