import { knex } from "./db";

export interface Session {
	_id: string;
	userId: string;
	browser: string;
	arch: string;
	os: string;
	createdAt: Date;
	lastConnectedAt: Date;
}

type PublicSession = Omit<Session, "userId">;

export const createSession = async (
	id: string,
	userId: string,
	browser: string,
	arch: string,
	os: string
): Promise<Session> => {
	try {
		const [session]: Session[] = await knex("Sessions")
			.insert({ _id: id, userId, browser, arch, os })
			.returning("*");
		return session;
	} catch (error) {
		throw error;
	}
};

export const getSessionsByUser = async (userId: string): Promise<PublicSession[]> => {
	try {
		const sessions: PublicSession[] = await knex("Sessions").select().where({ userId });

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

export const updateSessionLastConnectedDate = async (sessionId: string, lastConnectedAt: Date) => {
	try {
		await knex("Sessions").where({ _id: sessionId }).update({ lastConnectedAt });
	} catch (error) {
		throw error;
	}
};
