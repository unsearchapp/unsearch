import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findUserByEmail, getUserById, User, createUserWithGoogle } from "../../db/usersModel";
import { logger } from "../../utils/logger";
import bcrypt from "bcryptjs";

// Email and password strategy
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

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
	// Google OAuth strategy
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID as string,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
				callbackURL: "/api/auth/google/callback" // The callback route configured in Google
			},
			async (accessToken: string, refreshToken: string, profile: any, done: Function) => {
				try {
					// Check if the user exists by Google ID
					let user = await findUserByEmail(profile.emails[0].value);

					if (!user) {
						// Create a new user if they don't exist
						user = await createUserWithGoogle({
							googleId: profile.id,
							email: profile.emails[0].value
						});
					}

					// Return the user
					return done(null, user);
				} catch (error) {
					logger.error(error, "Google authentication error");
					return done(null, false, { message: "Something went wrong, please try again later" });
				}
			}
		)
	);
}

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
