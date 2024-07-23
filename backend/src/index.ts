import wsServer from "./wsServer/wsServer";
import setUpHttpServer from "./httpServer";

const { wss, port } = wsServer;
console.log(`WebSocket server is running on ws://localhost:${port}`);

// Http server setup
setUpHttpServer();
