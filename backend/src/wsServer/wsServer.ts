import ws from "ws";
import { MessageType } from "./models/messageTypes";
import {
	validateAuthPayload,
	validateIdPayload,
	validateHistoryAddPayload,
	validateBookmarksAddPayload,
	validateHistoryDeletePayload,
	validateBookmarksDeletePayload,
	validateBookmarksMovePayload,
	validateBookmarksUpdatePayload
} from "./utils/validatePayloads";
import { validateToken } from "./utils/validateToken";
import { idHandler } from "./handlers/idHandler";
import { historyAddHandler } from "./handlers/historyAddHandler";
import {
	bookmarksAddHandler,
	bookmarksDeleteHandler,
	bookmarksMoveHandler,
	bookmarksUpdateHandler
} from "./handlers/bookmarksHandlers";
import { historyDeleteHandler } from "./handlers/historyDeleteHandler";
import { UserConnection } from "./models/wsServer";
import { Session } from "../db/sessionsModel";
import {
	Message,
	createPendingMessage,
	getPendingMessagesBySession,
	updateMessageStatus
} from "../db/messagesModel";

const port = process.env.WS_PORT;
if (!port) {
	throw "WS_PORT enviroment variable is missing";
}

const wss = new ws.WebSocketServer({ port: parseInt(port) });

const usersConnections: Map<string, UserConnection> = new Map();

export const sendMessageToUser = async (userId: string, sessionId: string, message: string) => {
	const userConnection = usersConnections.get(sessionId);

	if (userConnection) {
		// User is connected, send the message
		try {
			userConnection.ws.send(message);
		} catch (error) {
			console.error("Error sending message:", error);
			// If sending fails, add to the message queue
			await createPendingMessage(userId, sessionId, message);
		}
	} else {
		await createPendingMessage(userId, sessionId, message);
	}
};

wss.on("connection", (ws: any, req: any) => {
	let userId: string | null = null;
	let sessionId: string | null = null;

	ws.on("error", console.error);

	ws.on("close", () => {
		if (userId && sessionId) {
			usersConnections.delete(sessionId);
		}
	});

	ws.on("message", async (message: string) => {
		try {
			const { type, payload } = JSON.parse(message);

			switch (type) {
				case MessageType.AUTH:
					if (validateAuthPayload(payload)) {
						const result = validateToken(payload.token);

						if (result) {
							userId = result.userId;
							ws.send(JSON.stringify({ type: "AUTH_SUCCESS" }));
						}
					}
					break;

				case MessageType.ID:
					if (!userId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateIdPayload(payload)) {
							try {
								const session: Session = await idHandler(payload, userId);

								sessionId = session._id;
								usersConnections.set(sessionId, { ws }); // Save user connection
								ws.send(JSON.stringify({ type: "ID_SUCCESS" }));

								// Handle pending messages
								try {
									const messages: Message[] = await getPendingMessagesBySession(sessionId);
									for (const msg of messages) {
										ws.send(msg.message);
										await updateMessageStatus(msg._id);
									}
								} catch (error) {}

								ws.send(JSON.stringify({ type: "HISTORY_INIT" })); // Check if session has previous data
							} catch (error) {
								console.error(error);
								ws.send(JSON.stringify({ type: "ERROR" }));
							}
						}
					}
					break;

				case MessageType.HISTORY_ADD:
					if (!userId || !sessionId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateHistoryAddPayload(payload)) {
							try {
								await historyAddHandler(payload, userId, sessionId);
							} catch (error) {
								ws.send(JSON.stringify({ type: "ERROR" }));
							}
						}
					}

					break;

				case MessageType.HISTORY_DELETE:
					if (!userId || !sessionId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateHistoryDeletePayload(payload)) {
							try {
								await historyDeleteHandler(payload, userId, sessionId);
							} catch (error) {
								ws.send(JSON.stringify({ type: "ERROR" }));
							}
						}
					}
					break;

				case MessageType.BOOKMARKS_ADD:
					if (!userId || !sessionId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateBookmarksAddPayload(payload)) {
							try {
								await bookmarksAddHandler(payload, userId, sessionId);
							} catch (error) {
								ws.send(JSON.stringify({ type: "ERROR" }));
							}
						}
					}
					break;

				case MessageType.BOOKMARKS_DELETE:
					if (!userId || !sessionId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateBookmarksDeletePayload(payload)) {
							try {
								await bookmarksDeleteHandler(payload, userId, sessionId);
							} catch (error) {
								ws.send(JSON.stringify({ type: "ERROR", error }));
							}
						}
					}
					break;

				case MessageType.BOOKMARKS_MOVE:
					if (!userId || !sessionId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateBookmarksMovePayload(payload)) {
							try {
								await bookmarksMoveHandler(payload, userId, sessionId);
							} catch (error) {
								ws.send(JSON.stringify({ type: "ERROR", error }));
							}
						}
					}
					break;

				case MessageType.BOOKMARKS_UPDATE:
					if (!userId || !sessionId) {
						ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
					} else {
						if (validateBookmarksUpdatePayload(payload)) {
							try {
								await bookmarksUpdateHandler(payload, userId, sessionId);
							} catch (error) {
								ws.send(JSON.stringify({ type: "ERROR", error }));
							}
						}
					}
					break;

				case MessageType.PING:
					break;

				default:
					console.log("Unexpected message");
			}
		} catch (error) {
			console.log("Error parsing the message", error);
		}
	});
});

export default { wss, port };
