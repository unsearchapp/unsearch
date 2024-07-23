import knex from "./db";

export interface Message {
	_id: string;
	userId: string;
	message: string;
	status: string;
	createdAt: Date;
	sentAt: Date;
}

export const createPendingMessage = async (
	userId: string,
	sessionId: string,
	message: string
): Promise<string> => {
	try {
		const messageId: string = await knex("Messages")
			.insert({ userId, sessionId, message })
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
