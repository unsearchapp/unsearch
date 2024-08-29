import { knex } from "./db";

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

export const handlePendingMessage = async (
	userId: string,
	sessionId: string,
	type: string,
	payload: any
) => {
	if (type === "BOOKMARKS_UPDATE" || type === "BOOKMARKS_MOVE") {
		const itemId = payload.id;
		let updatedFields: any = {};

		if (type === "BOOKMARKS_UPDATE") {
			// For BOOKMARKS_UPDATE, update title and url
			updatedFields = {
				title: payload.changes.title,
				url: payload.changes.url
			};
		} else if (type === "BOOKMARKS_MOVE") {
			// For BOOKMARKS_MOVE, update index and parentId
			updatedFields = {
				index: payload.destination.index,
				parentId: payload.destination.parentId
			};
		}

		// Check for existing pending message of type BOOKMARKS_CREATE
		const existingMessage = await knex("Messages")
			.where({ userId, sessionId, msg_type: "BOOKMARKS_CREATE" })
			.andWhereRaw(`msg_payload->>'id' = ?`, [itemId])
			.andWhere({ status: "pending" })
			.first();

		if (existingMessage) {
			// Update the fields in the existing pending message
			const updatedPayload = {
				...existingMessage.msg_payload,
				createDetails: {
					...existingMessage.msg_payload.createDetails,
					...updatedFields
				}
			};

			await knex("Messages")
				.update({ msg_payload: updatedPayload })
				.where({ _id: existingMessage._id });
			return existingMessage._id;
		}
	} else if (type === "BOOKMARKS_REMOVE") {
		const itemId = payload.id;
		// Remove the existing pending message of type BOOKMARKS_CREATE
		await knex("Messages")
			.where({ userId, sessionId, msg_type: "BOOKMARKS_CREATE" })
			.andWhereRaw(`msg_payload->>'id' = ?`, [itemId])
			.andWhere({ status: "pending" })
			.del();

		// No new message needs to be created for removal
		return;
	}

	// For other message types or if no update/removal is needed, create a new pending message
	await createPendingMessage(userId, sessionId, type, payload);
};

export const getPendingMessagesBySession = async (sessionId: string): Promise<Message[]> => {
	try {
		// Fetch all pending messages for the session
		const messages: Message[] = await knex("Messages")
			.select()
			.where({ sessionId, status: "pending" });

		// Filter out messages where the parentId or destination.parentId is still a temporary ID
		const finalMessages = await Promise.all(
			messages.map(async (msg) => {
				if (msg.msg_type === "BOOKMARKS_CREATE" && msg.msg_payload.createDetails.parentId) {
					const parentId = msg.msg_payload.createDetails.parentId;

					// Check if the parentId is also pending for creation
					const parentPending = await knex("Messages")
						.where({
							sessionId,
							status: "pending",
							msg_type: "BOOKMARKS_CREATE"
						})
						.andWhereRaw(`msg_payload->>'id' = ?`, [parentId])
						.first();

					if (parentPending) {
						// If the parent ID is still pending, exclude this message
						return null;
					}
				} else if (msg.msg_type === "BOOKMARKS_MOVE" && msg.msg_payload.destination.parentId) {
					const parentId = msg.msg_payload.destination.parentId;

					// Check if the parentId in the destination is also pending for creation
					const parentPending = await knex("Messages")
						.where({
							sessionId,
							status: "pending",
							msg_type: "BOOKMARKS_CREATE"
						})
						.andWhereRaw(`msg_payload->>'id' = ?`, [parentId])
						.first();

					if (parentPending) {
						// If the destination parent ID is still pending, exclude this message
						return null;
					}
				}
				// If there's no issue with the parentId, include the message
				return msg;
			})
		);

		// Remove null values (messages to be excluded)
		return finalMessages.filter((msg): msg is Message => msg !== null);
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
