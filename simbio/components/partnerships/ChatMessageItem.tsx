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

  // 1. Simbi AI Companion Message Bubble
  if (isSimbiAi) {
    return (
      <div className="flex gap-2 items-start w-full my-1.5">
        {/* Capybara Simbi AI Badge Icon */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-white animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        <div className="flex flex-col min-w-0 max-w-[78%] sm:max-w-[72%] items-start space-y-0.5">
          <div className="flex items-center gap-1.5 px-0.5">
            <span className="text-[11px] font-bold text-sky-700">Simbi AI</span>
            <span className="soft-badge bg-sky-100 text-sky-800 border-sky-200 text-[9px] px-1.5 py-0">
              AI Companion
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-2xl bg-sky-50/90 text-slate-800 border border-sky-200/90 text-xs sm:text-sm font-normal leading-relaxed shadow-2xs break-words relative group w-full">
            {/* Quoted Message Preview */}
            {m.replyTo && (
              <div className="mb-2 p-2 rounded-lg bg-white/90 border-l-2 border-sky-500 text-[10px] font-medium text-slate-700 shadow-2xs">
                <div className="font-bold text-sky-700 flex items-center gap-1">
                  <CornerDownRight className="w-3 h-3" />
                  <span>
                    {m.replyTo.senderType === 'SIMBI_AI'
                      ? 'Simbi AI'
                      : m.replyTo.senderId === myUserId
                      ? 'Me'
                      : partnerName}
                  </span>
                </div>
                <p className="line-clamp-2 italic text-slate-600 mt-0.5 leading-normal">{m.replyTo.content}</p>
              </div>
            )}

            <p className="whitespace-pre-wrap break-words text-left text-slate-800 text-xs sm:text-sm leading-relaxed">{m.content}</p>

            <button
              onClick={() => onReply(m)}
              className="mt-1.5 text-[10px] font-bold text-sky-700 hover:text-slate-900 flex items-center gap-1 transition cursor-pointer"
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
          </div>

          <span className="text-[10px] text-slate-400 font-medium px-0.5">
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
    if (m.replyTo.senderId === myUserId) return 'Me';
    return partnerName;
  };

  return (
    <div className={`flex gap-2 items-end ${isMine ? 'flex-row-reverse' : 'flex-row'} w-full my-1`}>
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FF6B30] text-white font-bold flex items-center justify-center text-[10px] sm:text-xs shrink-0 shadow-2xs mb-0.5">
        {isMine ? 'ME' : partnerName.charAt(0).toUpperCase()}
      </div>

      <div className={`flex flex-col min-w-0 max-w-[78%] sm:max-w-[72%] ${isMine ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-normal leading-relaxed shadow-2xs break-words relative group ${
            isMine ? 'bg-[#FF6B30] text-white' : 'bg-white text-slate-800 border border-slate-200/80'
          }`}
        >
          {/* Quoted Message Preview */}
          {m.replyTo && (
            <div className={`mb-1.5 p-1.5 rounded-lg text-[10px] font-medium border-l-2 ${
              isMine ? 'bg-black/15 border-white text-white/90' : 'bg-slate-50 border-[#FF6B30] text-slate-700'
            }`}>
              <div className="font-bold flex items-center gap-1 opacity-90">
                <CornerDownRight className="w-3 h-3" />
                <span>{getQuotedSenderName()}</span>
              </div>
              <p className="line-clamp-2 italic opacity-90 mt-0.5 leading-normal">{m.replyTo.content}</p>
            </div>
          )}

          <p className="whitespace-pre-wrap break-words text-left leading-relaxed">{m.content}</p>

          <button
            onClick={() => onReply(m)}
            className={`mt-1 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
              isMine ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            <Reply className="w-3 h-3" />
            <span>Reply</span>
          </button>
        </div>

        <span className="text-[10px] text-slate-400 font-medium mt-0.5 px-0.5">
          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
