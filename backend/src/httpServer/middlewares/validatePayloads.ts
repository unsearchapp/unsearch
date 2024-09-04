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
