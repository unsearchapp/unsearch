import { Router } from "express";
import { createUser, User } from "../../db/usersModel";
import passport from "passport";
import bcrypt from "bcrypt";
import "../auth/passport-config";
import { logger } from "../../utils/logger";

const router = Router();

router.post("/login", (req, res, next) => {
	passport.authenticate(
		"local",
		(error: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
			if (error) {
				return next(error);
			}
			if (!user) {
				return res.status(401).send(info);
			}

			req.logIn(user, (error) => {
				if (error) {
					return next(error);
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
				res.status(401).json({ message: "Registration failed" });
			}
			res.json(user);
		});
	} catch (error) {
		logger.error(error, "Error in registration");
		res.status(401).json({ message: "Registration failed" });
	}
});

export default router;
