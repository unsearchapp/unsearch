import express from "express";
import session from "express-session";
import passport from "passport";
import morgan from "morgan";
import cors from "cors";
import historyItemsRouter from "./routes/historyItemsRoutes";
import "./auth/passport-config";
import wsTokenRouter from "./routes/wsTokensRoutes";
import bookmarksRouter from "./routes/bookmarksRoutes";
import sessionsRouter from "./routes/sessionRoutes";
import authRouter from "./routes/authRoutes";
import tabsRouter from "./routes/tabsRoutes";
import messageRouter from "./routes/messagesRoutes";
import customersRouter from "./routes/customersRoutes";
import pgSession from "connect-pg-simple";
import { pool } from "../db/db";
import { logger } from "../utils/logger";

const app = express();
const port = process.env.HTTP_PORT;
const isSelfHosted = process.env.SELF_HOSTED === "true";

app.use(
	cors({
		origin: `http://localhost:${process.env.HTTP_PORT}`,
		credentials: true
	})
);
app.use(morgan("dev"));
app.use("/packages", express.static("/usr/src/packages"));
app.use((req, res, next) => {
	if (req.originalUrl === "/api/webhook") {
		next();
	} else {
		express.json()(req, res, next);
	}
});

app.use(express.urlencoded({ extended: false }));

const PgStore = pgSession(session);
const sessionSecret = process.env.SESSION_SECRET || "supersecret";

export const sessionMiddleware = session({
	secret: sessionSecret,
	resave: false,
	saveUninitialized: false,
	cookie: { secure: false },
	store: new PgStore({
		pool: pool,
		tableName: "authSessions"
	})
});

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api", historyItemsRouter);
app.use("/api", wsTokenRouter);
app.use("/api", bookmarksRouter);
app.use("/api", sessionsRouter);
app.use("/api", authRouter);
app.use("/api", tabsRouter);
app.use("/api", messageRouter);
if (!isSelfHosted) {
	app.use("/api", customersRouter);
}

function setUpHttpServer() {
	app.listen(port, () => {
		logger.info(`Server is running on port ${port}`);
	});
}

export default setUpHttpServer;
