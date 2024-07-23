import WebSocket = require("ws");

export interface UserConnection {
	ws: WebSocket;
}
