import 'dotenv/config';
import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './infrastructure/logger/index.js';
import { initWebSocketServer } from './infrastructure/websocket/socket.js';

const server = http.createServer(app);

// Attach Socket.IO WebSocket server for real-time partner direct messaging
initWebSocketServer(server);

server.listen(env.PORT, () => {
  logger.info(`🚀 Simbioly API & Real-time WebSocket running on http://localhost:${env.PORT}`);
  logger.info(`   Environment: ${env.NODE_ENV}`);
});
