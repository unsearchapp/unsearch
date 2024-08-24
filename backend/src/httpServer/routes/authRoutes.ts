import { Router } from "express";
import { createUser, User } from "../../db/usersModel";
import passport from "passport";
import bcrypt from "bcryptjs";
import "../auth/passport-config";
import { logger } from "../../utils/logger";

const router = Router();

router.post("/login", (req, res, next) => {
	passport.authenticate(
		"local",
		(error: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
			if (error) {
				logger.error(error, "Unexpected authentication error on login");
				return res.status(500).send({ message: "Something went wrong, please try again later" });
			}
			if (!user) {
				return res.status(401).send(info);
			}

			req.logIn(user, (error) => {
				if (error) {
					logger.error(error, "Login session error");
					return res.status(500).send({ message: "Something went wrong, please try again later" });
				}

				return res.json({ user });
			});
		}
	)(req, res, next);
});

router.post("/logout", (req, res, next) => {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
	});
});

router.get("/checkAuth", (req, res) => {
	if (req.isAuthenticated()) {
		res.json({ user: req.user });
	} else {
		res.status(401).json({ message: "Unauthorized" });
	}
});

router.post("/register", async (req, res) => {
	const { email, password } = req.body;

	try {
		const hashedPassword = await bcrypt.hash(password, 10);

		const user: User = await createUser(email, hashedPassword);

		req.login(user, (err) => {
			if (err) {
				logger.error(err, "Error login in /register route");
				return res.status(500).json({ message: "Something went wrong, please try again later" });
			}
			res.json({ user });
		});
	} catch (error) {
		logger.error(error, "Error in registration");
		// Handle specific error messages
		if (error instanceof Error && error.message === "Email already in use") {
			// Send specific message for duplicate emails
			return res.status(409).json({ message: "Email already in use" });
		}

		// Send a generic error message for other cases
		return res.status(500).json({ message: "Something went wrong, please try again later" });
	}
});

export default router;
