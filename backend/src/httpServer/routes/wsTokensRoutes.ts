import jwt from "jsonwebtoken";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../../utils/logger";

const router = Router();

router.get("/token", requireAuth, async (req, res) => {
	try {
		const token = jwt.sign({ userId: req.user!._id }, process.env.JWT_SECRET as string, {
			expiresIn: "1h"
		});

		res.json({ token });
	} catch (error) {
		logger.error(error, "Error in /token GET route");
		res.status(500).json({ error });
	}
});

export default router;
