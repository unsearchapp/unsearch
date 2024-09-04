import { Router } from "express";
import { deleteSessionById, getSessionsByUser } from "../../db/sessionsModel";
import { requireAuth } from "../middlewares/requireAuth";
import { validateSession } from "../middlewares/validatePayloads";
import { closeSession } from "../../wsServer/wsServer";
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

router.post("/sessions/logout", requireAuth, validateSession, async (req, res) => {
	try {
		const sessionId = req.body.sessionId as string;

		// Close session if active
		closeSession(sessionId);

		res.json({ data: true });
	} catch (error) {
		logger.error("Error in /sessions/logout POST route");
		res.status(500).json({ data: false });
	}
});

router.delete("/sessions", requireAuth, validateSession, async (req, res) => {
	try {
		const sessionId = req.body.sessionId as string;

		// Close session if active
		closeSession(sessionId);

		const rowsDeleted: number = await deleteSessionById(req.user!._id, sessionId);

		res.json({ data: rowsDeleted });
	} catch (error) {
		logger.error("Error in /sessions DELETE route");
		res.status(500).json({ data: 0 });
	}
});

export default router;
