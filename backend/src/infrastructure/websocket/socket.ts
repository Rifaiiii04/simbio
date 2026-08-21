import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../logger/index.js';
import * as partnershipsRepo from '../../modules/partnerships/partnerships.repository.js';
import * as projectsService from '../../modules/projects/projects.service.js';
import { processSimbiAiMention } from '../../modules/partnerships/simbi-ai.service.js';

let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return io;
}

export function initWebSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    logger.info({ socketId: socket.id }, '⚡ Real-time WebSocket partner client connected');

    // Join personal user notification channel (for real-time Navbar and bottom bar badge counts)
    socket.on('join_user', (userId: string) => {
      if (userId) {
        socket.join(`user_${userId}`);
        logger.info({ socketId: socket.id, userId }, 'Joined user notification room');
      }
    });

    // Join specific partnership chat room
    socket.on('join_room', (partnershipId: string) => {
      socket.join(partnershipId);
      logger.info({ socketId: socket.id, partnershipId }, 'Joined partnership room');
    });

    // Leave partnership chat room
    socket.on('leave_room', (partnershipId: string) => {
      socket.leave(partnershipId);
    });

    // Real-time direct message event
    socket.on('send_message', async (data: { partnershipId: string; senderId: string; content: string; replyToId?: string }) => {
      try {
        const { partnershipId, senderId, content, replyToId } = data;
        if (!partnershipId || !senderId || !content?.trim()) return;

        // Persist message to database
        const savedMessage = await partnershipsRepo.createMessage({
          partnershipId,
          senderId,
          content: content.trim(),
          replyToId: replyToId || null,
        });

        // Broadcast real-time message to all clients in the partnership room
        io?.to(partnershipId).emit('receive_message', savedMessage);

        // Notify recipient personal room to update notification badges in real-time
        const p = await partnershipsRepo.findById(partnershipId);
        if (p) {
          const recipientId = p.requesterId === senderId ? p.recipientId : p.requesterId;
          io?.to(`user_${recipientId}`).emit('notification_badge_update', {
            partnershipId,
            senderId,
            message: savedMessage,
          });
        }

        // Process @SimbiAI mention if present in user message
        if (/@simbiai/i.test(content)) {
          processSimbiAiMention({
            partnershipId,
            senderId,
            userMessageId: savedMessage.id,
            userContent: content.trim(),
            replyToId: replyToId || null,
            io,
          });
        }
      } catch (err) {
        logger.error({ err }, 'Failed to process WebSocket message');
      }
    });

    // Real-time mark messages as read event
    socket.on('mark_read', async (data: { partnershipId: string; readerId: string }) => {
      try {
        const { partnershipId, readerId } = data;
        if (!partnershipId || !readerId) return;
        const { count, readAt } = await partnershipsRepo.markMessagesAsRead(partnershipId, readerId);
        if (count > 0) {
          io?.to(partnershipId).emit('messages_read', { partnershipId, readerId, readAt });
          io?.to(`user_${readerId}`).emit('notification_badge_update');
        }
      } catch (err) {
        logger.error({ err }, 'Failed to mark messages as read via WebSocket');
      }
    });

    // Real-time project creation event
    socket.on(
      'create_project',
      async (data: { partnershipId: string; senderId: string; title: string; description?: string }) => {
        try {
          const { partnershipId, senderId, title, description } = data;
          if (!partnershipId || !senderId || !title?.trim()) return;

          const createdProject = await projectsService.createProject(senderId, {
            partnershipId,
            title: title.trim(),
            description: description?.trim(),
          });

          io?.to(partnershipId).emit('project_created', createdProject);

          const announcementText = `Your partner created a new project: ${title.trim()}`;
          const savedMessage = await partnershipsRepo.createMessage({
            partnershipId,
            senderId,
            content: announcementText,
          });

          io?.to(partnershipId).emit('receive_message', savedMessage);
        } catch (err) {
          logger.error({ err }, 'Failed to process WebSocket create_project');
        }
      }
    );

    // =========================================================================
    // WebRTC Audio Signaling & Call Invite Events
    // =========================================================================

    socket.on('incoming_audio_call', (data: { partnershipId: string; session: unknown }) => {
      socket.to(data.partnershipId).emit('incoming_audio_call', data.session);
    });

    socket.on('audio_call_accepting', (data: { partnershipId: string }) => {
      io?.to(data.partnershipId).emit('audio_call_accepting');
    });

    socket.on('audio_call_accepted', (data: { partnershipId: string; session: unknown }) => {
      io?.to(data.partnershipId).emit('audio_call_accepted', data.session);
    });

    socket.on('audio_call_rejected', (data: { partnershipId: string }) => {
      io?.to(data.partnershipId).emit('audio_call_rejected');
    });

    socket.on('audio_offer', (data: { partnershipId: string; offer: unknown }) => {
      socket.to(data.partnershipId).emit('audio_offer', data.offer);
    });

    socket.on('audio_answer', (data: { partnershipId: string; answer: unknown }) => {
      socket.to(data.partnershipId).emit('audio_answer', data.answer);
    });

    socket.on('ice_candidate', (data: { partnershipId: string; candidate: unknown }) => {
      socket.to(data.partnershipId).emit('ice_candidate', data.candidate);
    });

    socket.on('audio_session_ended', (data: { partnershipId: string }) => {
      io?.to(data.partnershipId).emit('audio_session_ended');
    });

    socket.on('topic_updated', (data: { partnershipId: string }) => {
      io?.to(data.partnershipId).emit('topic_updated');
    });

    socket.on('update_message', (data: { partnershipId: string; message: unknown }) => {
      io?.to(data.partnershipId).emit('message_updated', data.message);
    });

    socket.on('typing', (data: { partnershipId: string; userId: string; userName: string }) => {
      socket.to(data.partnershipId).emit('partner_typing', data);
    });

    socket.on('stop_typing', (data: { partnershipId: string; userId: string }) => {
      socket.to(data.partnershipId).emit('partner_stop_typing', data);
    });

    // Focus Session Mutual Confirmation Events
    socket.on('focus_request_start', (data: { partnershipId: string; requesterId: string; requesterName: string }) => {
      socket.to(data.partnershipId).emit('focus_start_proposed', data);
    });

    socket.on('focus_reject_start', (data: { partnershipId: string }) => {
      io?.to(data.partnershipId).emit('focus_start_rejected');
    });

    socket.on('focus_accept_start', (data: { partnershipId: string }) => {
      io?.to(data.partnershipId).emit('focus_session_started');
    });

    socket.on('focus_request_pause', (data: { partnershipId: string; requesterId: string; requesterName: string }) => {
      socket.to(data.partnershipId).emit('focus_pause_proposed', data);
    });

    socket.on('focus_reject_pause', (data: { partnershipId: string }) => {
      io?.to(data.partnershipId).emit('focus_pause_rejected');
    });

    socket.on('focus_accept_pause', (data: { partnershipId: string }) => {
      io?.to(data.partnershipId).emit('focus_session_paused');
    });

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'WebSocket client disconnected');
    });
  });

  return io;
}

export function getWebSocketServer(): SocketIOServer | null {
  return io;
}
