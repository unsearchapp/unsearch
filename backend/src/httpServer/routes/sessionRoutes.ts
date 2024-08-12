import { Router } from "express";
import { deleteSessionById, getSessionsByUser } from "../../db/sessionsModel";
import { requireAuth } from "../middlewares/requireAuth";
import { usersConnections } from "../../wsServer/wsServer";
import { logger } from "../../utils/logger";

const router = Router();

router.get("/sessions", requireAuth, async (req, res) => {
	try {
		const sessionsItems = await getSessionsByUser(req.user!._id);
		const sessions = sessionsItems.map((session) => {
			const connection = usersConnections.get(session._id);
			return { ...session, active: !!connection };
		});

		res.json({ data: sessions });
	} catch (error) {
		logger.error(error, "Error in /sessions GET route");
		res.status(500).json({ error });
	}
});

router.delete("/sessions", requireAuth, async (req, res) => {
	try {
		const sessionId = req.body.sessionId as string;

		const rowsDeleted: number = await deleteSessionById(req.user!._id, sessionId);

		// Send message back to extension
		const message = JSON.stringify({ type: "SESSION_REMOVE" });
		sendMessageToUser(req.user!._id, sessionId, message);

		res.json({ data: rowsDeleted });
	} catch (error) {
		logger.error("Error in /sessions DELETE route");
		res.status(500).json({ error });
	}
});

export default router;
