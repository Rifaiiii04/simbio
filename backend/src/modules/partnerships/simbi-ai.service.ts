import { prisma } from '../../infrastructure/database/prisma.js';
import { OpenRouterProvider } from '../../infrastructure/ai/openrouter.provider.js';
import * as repo from './partnerships.repository.js';
import { logger } from '../../infrastructure/logger/index.js';
import { Server as SocketIOServer } from 'socket.io';

const aiProvider = new OpenRouterProvider();

export async function processSimbiAiMention(params: {
  partnershipId: string;
  senderId: string;
  userMessageId: string;
  userContent: string;
  replyToId?: string | null;
  io?: SocketIOServer | null;
}) {
  const { partnershipId, senderId, userMessageId, userContent, replyToId, io } = params;

  if (!/@simbiai/i.test(userContent)) {
    return null;
  }

  try {
    const partnership = await prisma.partnership.findUnique({
      where: { id: partnershipId },
      include: {
        requester: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
      },
    });

    if (!partnership) return null;

    const senderName = senderId === partnership.requesterId ? partnership.requester.name : partnership.recipient.name;
    const partnerName = senderId === partnership.requesterId ? partnership.recipient.name : partnership.requester.name;

    let repliedContextText = '';
    let repliedAuthorName = '';

    if (replyToId) {
      const repliedMsg = await prisma.partnershipMessage.findUnique({
        where: { id: replyToId },
      });
      if (repliedMsg) {
        repliedContextText = repliedMsg.content;
        if (repliedMsg.senderType === 'SIMBI_AI') {
          repliedAuthorName = 'Simbi AI';
        } else if (repliedMsg.senderId === partnership.requesterId) {
          repliedAuthorName = partnership.requester.name;
        } else {
          repliedAuthorName = partnership.recipient.name;
        }
      }
    }

    // Clean @SimbiAI mention from prompt query
    const cleanQuery = userContent.replace(/@simbiai/gi, '').trim();

    const systemPrompt = `Kamu adalah Simbi, seekor Kapibara pintar, ramah, santai, dan ceria yang bertindak sebagai AI Companion & Study Buddy di Simbioly (platform pertukaran skill reciprocal).
Tugasmu adalah menjawab obrolan dari dua partner belajar (${senderName} dan ${partnerName}) di dalam room chat mereka.

Aturan Persona Simbi:
1. Bahasa & Gaya: Gunakan bahasa Indonesia yang santai, akrab, manusiawi, hangat, dan seru (seperti teman belajar yang asik, bukan robot kaku).
2. Nada Bicara: Selalu suportif, antusias, dan berikan dorongan positif/ide menarik untuk sesi belajar ${senderName} dan ${partnerName}.
3. Panjang Balasan: Singkat dan padat (1 sampai 3 paragraf pendek saja agar mudah dibaca di bubble chat).
4. Gunakan Emoji: Pakai emoji yang hangat dan ekspresif (seperti 🚀, 💡, 🐾, ✨, 🧠, 🤝, 🔥) agar obrolan makin terasa menyenangkan.
5. Konteks Pesan: Jawab pertanyaan ${senderName} secara relevan. Jika ada kutipan pesan dari ${repliedAuthorName || 'partner'}, hubungkan tanggapanmu dengan topik tersebut!`;

    const userPrompt = `${repliedContextText ? `[MEMBALAS PESAN ${repliedAuthorName.toUpperCase()}]: "${repliedContextText}"\n\n` : ''}PESAN DARI ${senderName.toUpperCase()}:\n"${cleanQuery || userContent}"`;

    // Broadcast Simbi AI is typing indicator
    if (io) {
      io.to(partnershipId).emit('simbi_ai_typing', { partnershipId, isTyping: true });
    }

    let aiReplyText = '';
    try {
      aiReplyText = await aiProvider.generateChatResponse(systemPrompt, userPrompt);
    } catch {
      aiReplyText = `Halo ${senderName}! 🐾 Sinyal Simbi sempat berkedip sebentar nih, tapi mengenai pertanyaan kamu ${repliedContextText ? `soal pesan ${repliedAuthorName}` : ''}: ide dan topik kalian bareng ${partnerName} sudah keren banget! Yuk lanjut bahas poin praktisnya bareng-bareng 🚀✨`;
    } finally {
      if (io) {
        io.to(partnershipId).emit('simbi_ai_typing', { partnershipId, isTyping: false });
      }
    }

    // Create AI response message in DB
    const aiMessage = await repo.createMessage({
      partnershipId,
      senderId: null,
      senderType: 'SIMBI_AI',
      senderName: 'Simbi AI',
      content: aiReplyText,
      replyToId: userMessageId,
    });

    // Broadcast real-time WebSocket message to both users in the room
    if (io) {
      io.to(partnershipId).emit('receive_message', aiMessage);
    }

    return aiMessage;
  } catch (err) {
    logger.error({ err, partnershipId }, 'Failed to process Simbi AI mention');
    return null;
  }
}
