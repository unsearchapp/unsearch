import { Request, Response, NextFunction } from "express";
import { validate } from "uuid";
import { getSessionById } from "../../db/sessionsModel";
import { logger } from "../../utils/logger";

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
