import { Request, Response, NextFunction } from "express";
import { validate } from "uuid";
import { getSessionById } from "../../db/sessionsModel";
import { getBookmarkById } from "../../db/bookmarksModel";
import { logger } from "../../utils/logger";
import {
	createBookmarkBody,
	UpdateBookmarkBody,
	MoveBookmarkBody,
	DeleteBookmarkBody
} from "../routes/bookmarksRoutes";

export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const sessionId = req.body.sessionId as string;

		// Check if sessionId is provided
		if (!sessionId) {
			return res.status(400).json({ error: "sessionId is required" });
		}

		// Check if sessionId is a valid UUID
		if (!validate(sessionId)) {
			return res.status(400).json({ error: "Invalid sessionId format" });
		}

		// Fetch session
		const session = await getSessionById(sessionId);

		// Check if the session exists and belongs to the logged-in user
		if (!session || session.userId !== req.user!._id) {
			return res.status(403).json({ error: "You do not have permission to logout this session" });
		}

		next();
	} catch (error) {
		logger.error("Error validating session request:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const validateGetTabsRequest = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const lastDate = req.query.lastDate as string;

		// Allow lastDate if it's either an empty string or a valid date
		if (lastDate !== "" && isNaN(new Date(lastDate).getTime())) {
			return res.status(400).json({ error: "Invalid lastDate format" });
		}

		next();
	} catch (error) {
		logger.error("Error validating tabs get request:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const validateDeleteTabRequest = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const tabId = req.body._id as string;

		// Check if sessionId is provided
		if (!tabId) {
			return res.status(400).json({ error: "_id is required" });
		}

		// Check if sessionId is a valid UUID
		if (!validate(tabId)) {
			return res.status(400).json({ error: "Invalid _id format" });
		}

		next();
	} catch (error) {
		logger.error("Error validating tab delete request:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const validateGetLogsRequest = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const page = req.query.page as string;

		// Check if page is provided
		if (!page) {
			return res.status(400).json({ error: "page parameter is required" });
		}

		// Check if page is a valid positive integer
		const pageNumber = Number(page);
		if (isNaN(pageNumber) || pageNumber <= 0 || !Number.isInteger(pageNumber)) {
			return res.status(400).json({ error: "page parameter must be a positive integer" });
		}

		next();
	} catch (error) {
		console.error("Error validating logs get request:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

function isValidUrl(str: string) {
	try {
		new URL(str);
		return true;
	} catch (err) {
		return false;
	}
}

export const validateCreateBookmarkRequest = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { sessionId, parentId, index, title, url, id }: createBookmarkBody = req.body;

		// Check if sessionId is provided and is a string
		if (!sessionId || typeof sessionId !== "string") {
			return res.status(400).json({ error: "sessionId is required and must be a string" });
		}

		// Check if sessionId is a valid UUID
		if (!validate(sessionId)) {
			return res.status(400).json({ error: "Invalid sessionId format" });
		}

		// Check if the session exists and belongs to the logged-in user
		const session = await getSessionById(sessionId);
		if (!session || session.userId !== req.user!._id) {
			return res.status(403).json({ error: "Session does not exist" });
		}

		// Check if parentId is provided and is a string
		if (!parentId || typeof parentId !== "string") {
			return res.status(400).json({ error: "parentId is required and must be a string" });
		}

		// Check if index is provided and if so, it's a positive integer
		if (index !== undefined && (!Number.isInteger(index) || index < 0)) {
			return res.status(400).json({ error: "index, if provided, must be a non-negative integer" });
		}

		// Check if title is provided and is a string
		if (!title || typeof title !== "string") {
			return res.status(400).json({ error: "title is required and must be a string" });
		}

		// Check if url is provided and if so, it's a valid URL
		if (url && !isValidUrl(url)) {
			return res.status(400).json({ error: "url, if provided, must be a valid URL" });
		}

		// Check if id is provided and is a string
		if (!id || typeof id !== "string") {
			return res.status(400).json({ error: "id is required and must be a string" });
		}

		next();
	} catch (error) {
		console.error("Error validating create bookmark request:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const validateUpdateBookmarkRequest = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { sessionId, title, url, _id }: UpdateBookmarkBody = req.body;

		// Validate _id: required and must be a UUID
		if (!_id) {
			return res.status(400).json({ error: "_id is required" });
		}

		if (typeof _id !== "string") {
			return res.status(400).json({ error: "_id must be a string" });
		}

		if (!validate(_id)) {
			return res.status(400).json({ error: "_id format is invalid" });
		}

		// Validate sessionId: required and must be a UUID
		if (!sessionId) {
			return res.status(400).json({ error: "sessionId is required" });
		}

		if (typeof sessionId !== "string") {
			return res.status(400).json({ error: "sessionId must be a string" });
		}

		if (!validate(sessionId)) {
			return res.status(400).json({ error: "sessionId format is invalid" });
		}

		// Check session (and the user making the req) owns that bookmark
		const bookmark = await getBookmarkById(_id);

		if (!bookmark) {
			return res.status(400).json({ error: "Bookmark does not exist" });
		}

		if (bookmark.sessionId !== sessionId || bookmark.userId !== req.user!._id) {
			return res.status(400).json({ error: "Bookmark does not exist" });
		}

		// Validate title: if provided, it must be a string
		if (title !== undefined && typeof title !== "string") {
			return res.status(400).json({ error: "title must be a string if provided" });
		}

		// Validate url: if provided, it must be a valid URL
		if (url !== undefined && !isValidUrl(url)) {
			return res.status(400).json({ error: "url must be a valid URL if provided" });
		}

		next();
	} catch (error) {
		console.error("Error validating update bookmark request:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const validateMoveBookmarkRequest = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id, sessionId, index, parentId }: MoveBookmarkBody = req.body;

		// Validate id: required and must be a string
		if (!id || typeof id !== "string") {
			return res.status(400).json({ error: "id is required and must be a string" });
		}

		// Validate sessionId: required and must be a string
		if (!sessionId || typeof sessionId !== "string" || !validate(sessionId)) {
			return res.status(400).json({ error: "sessionId is required and must be a string" });
		}

		// Validate index: required and must be a non-negative integer
		if (index === undefined || typeof index !== "number" || index < 0 || !Number.isInteger(index)) {
			return res
				.status(400)
				.json({ error: "index is required and must be a non-negative integer" });
		}

		// Validate parentId: required and must be a string
		if (!parentId || typeof parentId !== "string") {
			return res.status(400).json({ error: "parentId is required and must be a string" });
		}

		next();
	} catch (error) {
		console.error("Error validating move bookmark request:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const validateDeleteBookmarkRequest = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { id, sessionId }: DeleteBookmarkBody = req.body;

		// Validate id: required and must be a string
		if (!id || typeof id !== "string") {
			return res.status(400).json({ error: "id is required and must be a string" });
		}

		// Validate sessionId: required and must be a string
		if (!sessionId || typeof sessionId !== "string" || !validate(sessionId)) {
			return res.status(400).json({ error: "sessionId is required and must be a string" });
		}

		next();
	} catch (error) {
		console.error("Error validating delete bookmark request:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const validateExportBookmarksRequest = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const sessionId = req.query.sessionId as string;

		// Validate sessionId: required and must be a string
		if (!sessionId || typeof sessionId !== "string" || !validate(sessionId)) {
			return res.status(400).json({ error: "sessionId is required and must be a string" });
		}

		next();
	} catch (error) {
		console.error("Error validating export bookmarks request:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const validateGetHistoryItemsRequest = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { q, page, searchType, s } = req.query;

		// Validate query (q): Can be empty but must be a string
		if (q !== undefined && typeof q !== "string") {
			return res.status(400).json({ error: "q (query) must be a string" });
		}

		// Validate page: Must be a string that can be converted to a positive integer
		if (page) {
			const pageNumber = Number(page);
			if (isNaN(pageNumber) || pageNumber <= 0 || !Number.isInteger(pageNumber)) {
				return res.status(400).json({ error: "page must be a positive integer" });
			}
		} else {
			return res.status(400).json({ error: "page is required" });
		}

		// Validate searchType: Must match one of the allowed options
		if (!searchType) {
			return res.status(400).json({ error: "searchType is required" });
		}

		// Validate rawSessions (s): Can be a string, an array of strings, or undefined
		if (s !== undefined && typeof s !== "string" && !Array.isArray(s)) {
			return res
				.status(400)
				.json({ error: "s must be a string, an array of strings, or undefined" });
		}

		next();
	} catch (error) {
		console.error("Error validating get history request:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const validateDeleteHistoryItemsRequest = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { ids, all } = req.body;

		// Validate all: Must be a boolean
		if (typeof all !== "boolean") {
			return res.status(400).json({ error: "'all' is required and must be a boolean" });
		}

		// Validate ids: Must be an array of strings
		if (!Array.isArray(ids)) {
			return res.status(400).json({ error: "'ids' must be an array" });
		}
		if (ids.length === 0 && all === false) {
			return res.status(400).json({ error: "'ids' array cannot be empty" });
		}
		if (!ids.every((id) => typeof id === "string")) {
			return res.status(400).json({ error: "All elements in 'ids' must be strings" });
		}

		next();
	} catch (error) {
		console.error("Error validating delete history request:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
