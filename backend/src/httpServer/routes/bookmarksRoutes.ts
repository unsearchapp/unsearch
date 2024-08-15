import { Router, Request, Response } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
	getBookmarksByUser,
	deleteBookmarkById,
	updateBookmark,
	moveBookmark,
	createBookmark,
	getBookmarksBySession,
	PublicBookmark
} from "../../db/bookmarksModel";
import { sendMessageToUser } from "../../wsServer/wsServer";
import { logger } from "../../utils/logger";
import fs from "fs";
import path from "path";

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

function buildBookmarkTree(bookmarks: PublicBookmark[]): any {
	const bookmarkMap = new Map<string, any>();

	// Initialize a map with all items
	bookmarks.forEach((bookmark) => {
		bookmarkMap.set(bookmark.id, { ...bookmark, children: [] });
	});

	// Build the tree by assigning children to their parent folders
	const root: PublicBookmark[] = [];

	bookmarks.forEach((bookmark) => {
		if (bookmark.parentId) {
			const parent = bookmarkMap.get(bookmark.parentId);
			if (parent) {
				parent.children.push(bookmarkMap.get(bookmark.id));
			}
		} else {
			root.push(bookmarkMap.get(bookmark.id));
		}
	});

	return root;
}

const generateBookmarkHTML = (items: any[]): string => {
	let html = "<DL><p>\n";

	items.forEach((item) => {
		if (item.url) {
			// It's a bookmark
			html += `<DT><A HREF="${item.url}">${item.title}</A>\n`;
		} else {
			// It's a folder
			html += `<DT><H3>${item.title}</H3>\n`;
			html += generateBookmarkHTML(item.children);
		}
	});

	html += "</DL><p>\n";
	return html;
};

router.get("/bookmarks/export", requireAuth, async (req: Request, res: Response) => {
	const sessionId = req.query.sessionId as string;
	const bookmarks = await getBookmarksBySession(req.user!._id, sessionId);
	const bookmarkTree = buildBookmarkTree(bookmarks);

	let bookmarksHtml = `<DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n`;

	bookmarksHtml += generateBookmarkHTML(bookmarkTree);

	const filePath = path.join(__dirname, "bookmarks.html");
	fs.writeFileSync(filePath, bookmarksHtml);

	res.download(filePath, "bookmarks.html", (err) => {
		if (err) {
			console.error("Error downloading bookmarks:", err);
		}
		fs.unlinkSync(filePath); // Delete file after sending
	});
});

export default router;
