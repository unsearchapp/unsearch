import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { findUserByEmail, getUserById, User } from "../../db/usersModel";
const bcrypt = require("bcrypt");

passport.use(
	new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
		const user = await findUserByEmail(email);

		if (!user) {
			return done(null, false, { message: "Incorrect email or password" });
		}

		bcrypt.compare(password, user.password, (err: any, result: boolean | null) => {
			if (!result) {
				return done(null, false, { message: "Incorrect email or password" });
			}
		});

		return done(null, user);
	})
);

passport.serializeUser((user: Express.User, done) => {
	done(null, (user as User)._id);
});

passport.deserializeUser(async (id: number, done) => {
	const user = await getUserById(id);
	if (user) {
		done(null, user);
	} else {
		done(new Error("User not found"));
	}
});
