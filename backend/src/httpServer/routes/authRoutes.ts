import { Router, Request, Response, NextFunction } from "express";
import { createUser, User, updateUserPasswordByEmail } from "../../db/usersModel";
import passport from "passport";
import bcrypt from "bcryptjs";
import "../auth/passport-config";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { logger } from "../../utils/logger";
import { validateRequestResetPassword } from "../middlewares/validatePayloads";

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
		// Send a response back to the client
		return res.status(200).send({ message: "Logged out" });
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

let transporter;
if (
	process.env.SMTP_HOST &&
	process.env.SMTP_PORT &&
	process.env.SMTP_USER &&
	process.env.SMTP_PASS
) {
	transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT),
		secure: process.env.SMTP_SECURE === "true",
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS
		}
	});
} else {
	transporter = undefined;
}

const sendResetEmail = (email: string, token: string) => {
	const link = `${process.env.WEBAPP_URL}/reset-password?token=${token}`;

	if (transporter) {
		transporter.sendMail({
			from: process.env.EMAIL_FROM,
			to: email,
			subject: "Password Reset",
			text: `Click this link to reset your password: ${link}`
		});
	} else {
		logger.warn("SMTP settings are not configured. Email not sent");
		throw Error("SMTP settings are not configured. Email not sent");
	}
};

router.post(
	"/request-reset-password",
	validateRequestResetPassword,
	(req: Request, res: Response) => {
		try {
			const email = req.body.email as string;
			const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
				expiresIn: "1h" // Token expires in 1 hour
			});

			sendResetEmail(email, token);

			return res.status(200).json({ message: "Password reset link sent" });
		} catch (error) {
			logger.error(error, "Unexpected error on /generate-reset-link");
			return res.status(500).json({ message: "Something went wrong, please try again later" });
		}
	}
);

router.post("/reset-password", async (req: Request, res: Response) => {
	try {
		const { token, newPassword } = req.body;

		// Verify the JWT token
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };

		// Hash the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update the user's password
		await updateUserPasswordByEmail(decoded.email, hashedPassword);

		return res.status(200).json({ message: "Password successfully reset" });
	} catch (error) {
		logger.error(error, "Unexpected error on /reset-password");
		return res.status(400).json({ message: "Invalid or expired token" });
	}
});

router.get("/auth/google", (req: Request, res: Response, next: NextFunction) => {
	const fromExtension = req.query.fromExtension === "true" ? "true" : "false";

	passport.authenticate("google", {
		scope: ["profile", "email"],
		state: fromExtension // Pass it via OAuth state
	})(req, res, next);
});

// Google OAuth callback route
router.get("/auth/google/callback", (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate("google", (err: any, user: any, info: any) => {
		if (err) {
			return next(err);
		}
		if (!user) {
			// Handle the case where no user is returned (authentication failure)
			return res.redirect(`${process.env.WEBAPP_URL}/login?error=auth`);
		}

		// Log in the user and handle session
		req.logIn(user, (err: any) => {
			if (err) {
				return next(err);
			}

			// Check if fromExtension was passed
			const fromExtension = req.query.state === "true";

			// Redirect to the dashboard with the fromExtension param only if it's true
			const redirectUrl = fromExtension
				? `${process.env.WEBAPP_URL}?fromExtension=true`
				: `${process.env.WEBAPP_URL}`;

			res.redirect(redirectUrl);
		});
	})(req, res, next);
});

export default router;
