import { IdPayload } from "../models/payloads";
import { Session, getSessionById, createSession } from "../../db/sessionsModel";
import { getUserById } from "../../db/usersModel";

export const idHandler = async (payload: IdPayload, userId: string): Promise<Session> => {
	// Check user plan
	const isSelfHosted = process.env.SELF_HOSTED === "true";
	if (!isSelfHosted) {
		const user = await getUserById(userId);
		if (user && !user.isPaid) {
			throw Error("User has no valid plan.");
		}
	}

	let session: Session | undefined = await getSessionById(payload.id);

	if (session) {
		if (session.userId !== userId) {
			throw "Session not found";
		}
	} else {
		const sessionName = payload.browser.charAt(0).toUpperCase() + payload.browser.slice(1);
		session = await createSession(
			payload.id,
			userId,
			sessionName,
			payload.browser,
			payload.arch,
			payload.os
		);
	}

	return session;
};
