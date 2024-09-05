import { Router, Request, Response } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
	getBookmarksByUser,
	deleteBookmarkById,
	updateBookmarkById,
	moveBookmark,
	createBookmark,
	getBookmarksBySession,
	PublicBookmark
} from "../../db/bookmarksModel";
import { sendMessageToUser } from "../../wsServer/wsServer";
import { logger } from "../../utils/logger";
import fs from "fs";
import path from "path";
import {
	validateCreateBookmarkRequest,
	validateUpdateBookmarkRequest,
	validateMoveBookmarkRequest,
	validateDeleteBookmarkRequest,
	validateExportBookmarksRequest
} from "../middlewares/validatePayloads";

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

export interface createBookmarkBody {
	sessionId: string;
	parentId: string;
	index?: number;
	title: string;
	url?: string;
	id: string;
}

router.post(
	"/bookmarks",
	requireAuth,
	validateCreateBookmarkRequest,
	async (req: Request, res: Response) => {
		try {
			const userId = req.user!._id;
			const { sessionId, parentId, index, title, url, id }: createBookmarkBody = req.body;

			const bookmarkInsert = { userId, sessionId, parentId, index, title, url, id };
			const _id = await createBookmark(bookmarkInsert);

			// send message to extension
			const type = "BOOKMARKS_CREATE";
			const payload = { _id, id, createDetails: { index, parentId, title, url } };
			sendMessageToUser(userId, sessionId, type, payload);

			res.json({ data: true });
		} catch (error) {
			logger.error(error, "Error in /bookmarks POST route");
			res.status(500).json({ data: false });
		}
	}
);

export interface UpdateBookmarkBody {
	_id: string;
	sessionId: string;
	url?: string;
	title?: string;
}

router.patch(
	"/bookmarks",
	requireAuth,
	validateUpdateBookmarkRequest,
	async (req: Request, res: Response) => {
		try {
			const userId = req.user!._id;
			const { sessionId, _id, title, url }: UpdateBookmarkBody = req.body;
			const { rowsUpdated, updatedId } = await updateBookmarkById(_id, userId, url, title);

			if (rowsUpdated > 0) {
				// send message to extension
				const type = "BOOKMARKS_UPDATE";
				const payload = { id: updatedId, changes: { title, url } };

				sendMessageToUser(userId, sessionId, type, payload);
			}

			res.json({ data: rowsUpdated });
		} catch (error) {
			logger.error(error, "Error in /bookmarks POST route");
			res.status(500).json({ error });
		}
	}
);

export interface MoveBookmarkBody {
	id: string;
	sessionId: string;
	index: number;
	parentId: string;
}

router.post(
	"/bookmarks/move",
	requireAuth,
	validateMoveBookmarkRequest,
	async (req: Request, res: Response) => {
		try {
			const userId = req.user!._id;
			const { sessionId, id, index, parentId }: MoveBookmarkBody = req.body;

			const updatedRows = await moveBookmark(id, userId, sessionId, index, parentId);

			if (updatedRows > 0) {
				// send message to extension
				const type = "BOOKMARKS_MOVE";
				const payload = { id, destination: { index, parentId } };

				sendMessageToUser(userId, sessionId, type, payload);
			}

			res.json({ data: updatedRows });
		} catch (error) {
			logger.error(error, "Error in /bookmarks POST route");
			res.status(500).json({ error });
		}
	}
);

export interface DeleteBookmarkBody {
	sessionId: string;
	id: string;
}

router.delete("/bookmarks", requireAuth, validateDeleteBookmarkRequest, async (req, res) => {
	try {
		const { sessionId, id }: DeleteBookmarkBody = req.body;

		const rowsDeleted: number = await deleteBookmarkById(id, req.user!._id, sessionId);

		if (rowsDeleted > 0) {
			// Send message to extension
			const type = "BOOKMARKS_REMOVE";
			const payload = { id };
			sendMessageToUser(req.user!._id, sessionId, type, payload);
		}

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

router.get(
	"/bookmarks/export",
	requireAuth,
	validateExportBookmarksRequest,
	async (req: Request, res: Response) => {
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
	}
);

export default router;
