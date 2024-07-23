import knex from "./db";

export interface Session {
	_id: string;
	userId: string;
	browser: string;
	// createdAt: Date
	// lastConnectedAt: Date
}

type PublicSession = Omit<Session, "userId">;

export const createSession = async (
	id: string,
	userId: string,
	browser: string
): Promise<Session> => {
	try {
		await knex("Sessions").insert({ _id: id, userId, browser });
		const session: Session = {
			_id: id,
			userId,
			browser
		};
		return session;
	} catch (error) {
		throw error;
	}
};

export const getSessionsByUser = async (userId: string): Promise<PublicSession[]> => {
	try {
		const sessions: PublicSession[] = await knex("Sessions")
			.select("_id", "browser")
			.where({ userId });

		return sessions;
	} catch (error) {
		throw error;
	}
};

export const getSessionById = async (sessionId: string): Promise<Session | undefined> => {
	try {
		const session: Session | undefined = await knex("Sessions").where({ _id: sessionId }).first();
		return session;
	} catch (error) {
		throw error;
	}
};

export const deleteSessionById = async (userId: string, sessionId: string): Promise<number> => {
	try {
		const deletedRows: number = await knex("Sessions").where({ userId, _id: sessionId }).del();
		return deletedRows;
	} catch (error) {
		throw error;
	}
};
