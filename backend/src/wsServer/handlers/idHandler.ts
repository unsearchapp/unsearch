import { IdPayload } from "../models/payloads";
import { Session, getSessionById, createSession } from "../../db/sessionsModel";

export const idHandler = async (payload: IdPayload, userId: string): Promise<Session> => {
	let session: Session | undefined = await getSessionById(payload.id);

	if (session) {
		if (session.userId !== userId) {
			throw "Session not found";
		}
	} else {
		session = await createSession(payload.id, userId, payload.browser);
	}

	return session;
};
