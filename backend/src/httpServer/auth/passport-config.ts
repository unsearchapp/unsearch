import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { findUserByEmail, getUserById, User } from "../../db/usersModel";
import { logger } from "../../utils/logger";
import bcrypt from "bcryptjs";

passport.use(
	new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
		try {
			const user = await findUserByEmail(email);

			if (!user) {
				return done(null, false, { message: "Incorrect email or password" });
			}

			bcrypt.compare(password, user.password, (err: any, result: boolean | null) => {
				if (err) {
					logger.error(err, "bcrypt error");
					return done(null, false, { message: "Something went wrong, please try again later" });
				}
				if (!result) {
					return done(null, false, { message: "Incorrect email or password" });
				}

				return done(null, user);
			});
		} catch (error) {
			logger.error(error, "authentication error in LocalStrategy");
			return done(null, false, { message: "Something went wrong, please try again later" });
		}
	})
);

passport.serializeUser((user: Express.User, done) => {
	done(null, (user as User)._id);
});

passport.deserializeUser(async (id: string, done) => {
	const user = await getUserById(id);
	if (user) {
		done(null, user);
	} else {
		done(new Error("User not found"));
	}
});
