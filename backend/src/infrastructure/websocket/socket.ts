import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../logger/index.js';
import * as partnershipsRepo from '../../modules/partnerships/partnerships.repository.js';
import * as projectsService from '../../modules/projects/projects.service.js';

let io: SocketIOServer | null = null;

export function initWebSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info({ socketId: socket.id }, '⚡ Real-time WebSocket partner client connected');

    // Join specific partnership chat room
    socket.on('join_room', (partnershipId: string) => {
      socket.join(partnershipId);
      logger.info({ socketId: socket.id, partnershipId }, 'Joined partnership chat room');
    });

    // Leave partnership chat room
    socket.on('leave_room', (partnershipId: string) => {
      socket.leave(partnershipId);
    });

    // Real-time direct message event
    socket.on('send_message', async (data: { partnershipId: string; senderId: string; content: string }) => {
      try {
        const { partnershipId, senderId, content } = data;
        if (!partnershipId || !senderId || !content?.trim()) return;

        // Persist message to database
        const savedMessage = await partnershipsRepo.createMessage(partnershipId, senderId, content.trim());

        // Broadcast real-time message to all clients in the partnership room
        io?.to(partnershipId).emit('receive_message', savedMessage);
      } catch (err) {
        logger.error({ err }, 'Failed to process WebSocket message');
      }
    });

    // Real-time project creation event
    socket.on(
      'create_project',
      async (data: { partnershipId: string; senderId: string; title: string; description?: string }) => {
        try {
          const { partnershipId, senderId, title, description } = data;
          if (!partnershipId || !senderId || !title?.trim()) return;

          // 1. Create project via service
          const createdProject = await projectsService.createProject(senderId, {
            partnershipId,
            title: title.trim(),
            description: description?.trim(),
          });

          // 2. Broadcast project_created to all connected partners in real-time
          io?.to(partnershipId).emit('project_created', createdProject);

          // 3. Automatically send announcement chat message
          const announcementText = `Your partner created a new project: ${title.trim()}`;
          const savedMessage = await partnershipsRepo.createMessage(partnershipId, senderId, announcementText);

          // 4. Broadcast chat message to room
          io?.to(partnershipId).emit('receive_message', savedMessage);
        } catch (err) {
          logger.error({ err }, 'Failed to process WebSocket create_project');
        }
      }
    );

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'WebSocket client disconnected');
    });
  });

  return io;
}

export function getWebSocketServer(): SocketIOServer | null {
  return io;
}
