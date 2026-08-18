'use client';

import { Socket } from 'socket.io-client';
import { RoadmapProposalCard } from './RoadmapProposalCard';
import { CornerDownRight, Reply, Sparkles } from 'lucide-react';

interface QuotedMessage {
  id: string;
  content: string;
  senderId?: string | null;
  senderType?: string;
  senderName?: string | null;
}

export interface Message {
  id: string;
  partnershipId: string;
  senderId?: string | null;
  senderType?: string;
  senderName?: string | null;
  content: string;
  replyToId?: string | null;
  replyTo?: QuotedMessage | null;
  createdAt: string;
}

interface ChatMessageItemProps {
  message: Message;
  myUserId: string;
  partnerName: string;
  partnershipId: string;
  socket: Socket | null;
  onReply: (msg: Message) => void;
  onApprovedProposal?: () => void;
}

export function ChatMessageItem({
  message,
  myUserId,
  partnerName,
  partnershipId,
  socket,
  onReply,
  onApprovedProposal,
}: ChatMessageItemProps) {
  const m = message;
  const isMine = m.senderId === myUserId;
  const isSimbiAi = m.senderType === 'SIMBI_AI';
  const isProposal = m.content.includes('ROADMAP_PROPOSAL');

  if (isProposal) {
    return (
      <div className="flex justify-center w-full my-2">
        <RoadmapProposalCard
          partnershipId={partnershipId}
          myUserId={myUserId}
          partnerName={partnerName}
          messageId={m.id}
          content={m.content}
          socket={socket}
          onApproved={onApprovedProposal}
        />
      </div>
    );
  }

  // 1. Simbi AI Companion Special Message Bubble
  if (isSimbiAi) {
    return (
      <div className="flex gap-2.5 items-start w-full my-2">
        {/* Capybara Simbi AI Badge Icon */}
        <div className="w-9 h-9 rounded-2xl bg-[#06B6D4] border-2 border-[#0F172A] text-white font-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_#0F172A]">
          <Sparkles className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        <div className="flex flex-col min-w-0 max-w-[260px] sm:max-w-[320px] md:max-w-[360px] items-start space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#06B6D4] tracking-tight">Simbi AI</span>
            <span className="neo-badge bg-[#06B6D4] text-white text-[9px] px-2 py-0.5 font-black">
              AI Companion
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#ECFEFF] text-[#0F172A] border-2 border-[#0F172A] text-xs font-bold leading-relaxed shadow-[3px_3px_0px_0px_#06B6D4] break-all [overflow-wrap:anywhere] relative group">
            {/* Quoted Message Preview inside Simbi AI Bubble if replying */}
            {m.replyTo && (
              <div className="mb-2 p-2 rounded-xl bg-white/80 border-l-4 border-[#06B6D4] text-[11px] font-bold text-gray-700 shadow-sm">
                <div className="text-[10px] font-black text-[#06B6D4] flex items-center gap-1">
                  <CornerDownRight className="w-3 h-3" />
                  <span>
                    {m.replyTo.senderType === 'SIMBI_AI'
                      ? 'Simbi AI'
                      : m.replyTo.senderId === myUserId
                      ? 'Saya'
                      : partnerName}
                  </span>
                </div>
                <p className="line-clamp-2 italic text-gray-600 mt-0.5">{m.replyTo.content}</p>
              </div>
            )}

            <p className="whitespace-pre-wrap break-all [overflow-wrap:anywhere] text-left text-gray-900">{m.content}</p>

            <button
              onClick={() => onReply(m)}
              className="mt-2 text-[10px] font-black text-[#06B6D4] hover:text-[#0F172A] flex items-center gap-1 transition"
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
          </div>

          <span className="text-[9px] text-gray-400 font-mono px-1">
            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  }

  // 2. Regular User Message (Mine vs Partner)
  const getQuotedSenderName = () => {
    if (!m.replyTo) return '';
    if (m.replyTo.senderType === 'SIMBI_AI') return 'Simbi AI';
    if (m.replyTo.senderId === myUserId) return 'Saya';
    return partnerName;
  };

  return (
    <div className={`flex gap-2.5 items-end ${isMine ? 'flex-row-reverse' : 'flex-row'} w-full overflow-hidden`}>
      <div className="w-8 h-8 rounded-xl bg-[#FF7A30] border-2 border-[#0F172A] text-white font-black flex items-center justify-center text-xs flex-shrink-0 shadow-[1.5px_1.5px_0px_0px_#0F172A]">
        {isMine ? 'ME' : partnerName.charAt(0)}
      </div>

      <div className={`flex flex-col min-w-0 max-w-[200px] sm:max-w-[240px] md:max-w-[280px] ${isMine ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-3 rounded-2xl border-2 border-[#0F172A] text-xs font-bold leading-relaxed shadow-[2.5px_2.5px_0px_0px_#0F172A] break-all [overflow-wrap:anywhere] relative group ${
            isMine ? 'bg-[#FF7A30] text-white' : 'bg-white text-[#0F172A]'
          }`}
        >
          {/* Quoted Message Preview if replying to a message */}
          {m.replyTo && (
            <div className={`mb-2 p-2 rounded-xl text-[11px] font-bold border-l-4 ${
              isMine ? 'bg-black/15 border-white text-white/90' : 'bg-[#FFFDF7] border-[#FF7A30] text-gray-700'
            }`}>
              <div className="text-[10px] font-black flex items-center gap-1 opacity-90">
                <CornerDownRight className="w-3 h-3" />
                <span>{getQuotedSenderName()}</span>
              </div>
              <p className="line-clamp-2 italic opacity-90 mt-0.5">{m.replyTo.content}</p>
            </div>
          )}

          <p className="whitespace-pre-wrap break-all [overflow-wrap:anywhere] text-left">{m.content}</p>

          <button
            onClick={() => onReply(m)}
            className={`mt-1.5 text-[10px] font-black flex items-center gap-1 transition ${
              isMine ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-[#0F172A]'
            }`}
          >
            <Reply className="w-3 h-3" />
            <span>Reply</span>
          </button>
        </div>

        <span className="text-[9px] text-gray-400 font-mono mt-1 px-1">
          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
