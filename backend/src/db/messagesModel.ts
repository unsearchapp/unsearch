import knex from "./db";

export interface Message {
	_id: string;
	userId: string;
	sessionId: string;
	msg_type: string;
	msg_payload: any;
	status: string;
	createdAt: Date;
	sentAt: Date;
}

interface Session {
	browser: string;
	arch: string;
	os: string;
}

interface MessageWithSession extends Message {
	session: Session;
}

export const createPendingMessage = async (
	userId: string,
	sessionId: string,
	msg_type: string,
	msg_payload: any
): Promise<string> => {
	try {
		const messageId: string = await knex("Messages")
			.insert({ userId, sessionId, msg_type, msg_payload })
			.returning("_id");
		return messageId;
	} catch (error) {
		throw error;
	}
};

export const getPendingMessagesBySession = async (sessionId: string): Promise<Message[]> => {
	try {
		const messages: Message[] = await knex("Messages")
			.select()
			.where({ sessionId, status: "pending" });
		return messages;
	} catch (error) {
		throw error;
	}
};

export const getMessagesByUser = async (
	userId: string,
	pageSize: number,
	offset: number
): Promise<MessageWithSession[]> => {
	try {
		const messagesWithSessions = await knex<Message & Session>("Messages")
			.join("Sessions", "Messages.sessionId", "Sessions._id")
			.select("Messages.*", "Sessions.browser", "Sessions.arch", "Sessions.os")
			.where({ "Messages.userId": userId })
			.limit(pageSize)
			.offset(offset);

		const processedMessages: MessageWithSession[] = messagesWithSessions.map((row) => ({
			_id: row._id,
			userId: row.userId,
			sessionId: row.sessionId,
			msg_type: row.msg_type,
			msg_payload: row.msg_payload,
			status: row.status,
			createdAt: row.createdAt,
			sentAt: row.sentAt,
			session: {
				browser: row.browser,
				arch: row.arch,
				os: row.os
			}
		}));
		return processedMessages;
	} catch (error) {
		throw error;
	}
};

export const getPendingMessagesByUser = async (userId: string): Promise<Message[]> => {
	try {
		const messages: Message[] = await knex("Messages")
			.select()
			.where({ userId, status: "pending" });
		return messages;
	} catch (error) {
		throw error;
	}
};

export const updateMessageStatus = async (_id: string) => {
	try {
		await knex("Messages").where({ _id }).update({ status: "sent", sentAt: knex.fn.now() });
	} catch (error) {
		throw error;
	}
};
