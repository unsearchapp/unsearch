import { Router, Request, Response } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
	getBookmarksByUser,
	deleteBookmarkById,
	updateBookmark,
	moveBookmark,
	createBookmark
} from "../../db/bookmarksModel";
import { sendMessageToUser } from "../../wsServer/wsServer";
import { logger } from "../../utils/logger";

const router = Router();

router.get("/bookmarks", requireAuth, async (req: Request, res: Response) => {
	try {
		const bookmarks = await getBookmarksByUser(req.user!._id);
		res.json({ data: bookmarks });
	} catch (error) {
		logger.error(error, "Error in /bookmarks GET route");
		res.status(500).json({ error });
	}
});

interface createBookmarkBody {
	sessionId: string;
	parentId: string;
	index?: number;
	title: string;
	url?: string;
	id: string;
}

router.post("/bookmarks", requireAuth, async (req: Request, res: Response) => {
	try {
		const userId = req.user!._id;
		const { sessionId, parentId, index, title, url, id }: createBookmarkBody = req.body;

		const bookmarkInsert = { userId, sessionId, parentId, index, title, url, id };
		const _id = await createBookmark(bookmarkInsert);

		// send message to extension
		const payload = { _id, createDetails: { index, parentId, title, url } };
		const message = JSON.stringify({ type: "BOOKMARKS_CREATE", payload });
		sendMessageToUser(userId, sessionId, message);

		res.json({ data: true });
	} catch (error) {
		logger.error(error, "Error in /bookmarks POST route");
		res.status(500).json({ data: false });
	}
});

router.patch("/bookmarks", requireAuth, async (req: Request, res: Response) => {
	try {
		const userId = req.user!._id;
		const { sessionId, id, title, url } = req.body;

		const updatedRows = await updateBookmark(id, userId, sessionId, url, title);

		if (updatedRows > 0) {
			// send message to extension
			const payload = { id, changes: { title, url } };
			const message = JSON.stringify({ type: "BOOKMARKS_UPDATE", payload });
			sendMessageToUser(userId, sessionId, message);
		}

		res.json({ data: updatedRows });
	} catch (error) {
		logger.error(error, "Error in /bookmarks POST route");
		res.status(500).json({ error });
	}
});

router.post("/bookmarks/move", requireAuth, async (req: Request, res: Response) => {
	try {
		const userId = req.user!._id;
		const { sessionId, id, index, parentId } = req.body;

		const updatedRows = await moveBookmark(id, userId, sessionId, index, parentId);

		if (updatedRows > 0) {
			// send message to extension
			const payload = { id, destination: { index, parentId } };
			const message = JSON.stringify({ type: "BOOKMARKS_MOVE", payload });
			sendMessageToUser(userId, sessionId, message);
		}

		res.json({ data: updatedRows });
	} catch (error) {
		logger.error(error, "Error in /bookmarks POST route");
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
		logger.error(error, "Error in /bookmarks DELETE route");
		res.status(500).json({ error });
	}
});

export default router;
