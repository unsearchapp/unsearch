import wsServer from "./wsServer/wsServer";
import setUpHttpServer from "./httpServer";
import { logger } from "./utils/logger";

const { wss, port } = wsServer;
logger.info(`WebSocket server is running on ws://localhost:${port}`);

// Http server setup
setUpHttpServer();
