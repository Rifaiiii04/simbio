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
      <div className="flex justify-center w-full my-3">
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
      <div className="flex gap-3 items-start w-full my-2.5">
        {/* Capybara Simbi AI Badge Icon */}
        <div className="w-9 h-9 rounded-2xl bg-sky-600 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
          <Sparkles className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        <div className="flex flex-col min-w-0 max-w-[85%] sm:max-w-[78%] md:max-w-[72%] items-start space-y-1">
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-bold text-sky-700">Simbi AI</span>
            <span className="soft-badge bg-sky-100 text-sky-800 border-sky-200 text-[10px]">
              AI Companion
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/90 text-slate-800 border border-sky-200/90 text-sm font-normal leading-relaxed shadow-2xs break-words relative group">
            {/* Quoted Message Preview inside Simbi AI Bubble */}
            {m.replyTo && (
              <div className="mb-2.5 p-2.5 rounded-xl bg-white/90 border-l-3 border-sky-500 text-xs font-medium text-slate-700 shadow-2xs">
                <div className="text-[11px] font-bold text-sky-700 flex items-center gap-1">
                  <CornerDownRight className="w-3.5 h-3.5" />
                  <span>
                    {m.replyTo.senderType === 'SIMBI_AI'
                      ? 'Simbi AI'
                      : m.replyTo.senderId === myUserId
                      ? 'Saya'
                      : partnerName}
                  </span>
                </div>
                <p className="line-clamp-2 italic text-slate-600 mt-0.5 leading-normal">{m.replyTo.content}</p>
              </div>
            )}

            <p className="whitespace-pre-wrap break-words text-left text-slate-800 text-sm leading-relaxed">{m.content}</p>

            <button
              onClick={() => onReply(m)}
              className="mt-2 text-xs font-bold text-sky-700 hover:text-slate-900 flex items-center gap-1 transition"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium px-1">
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
    <div className={`flex gap-3 items-end ${isMine ? 'flex-row-reverse' : 'flex-row'} w-full overflow-hidden my-2`}>
      <div className="w-9 h-9 rounded-2xl bg-[#FF6B30] text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs mb-1">
        {isMine ? 'ME' : partnerName.charAt(0)}
      </div>

      <div className={`flex flex-col min-w-0 max-w-[85%] sm:max-w-[78%] md:max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-3.5 sm:p-4 rounded-2xl text-sm font-normal leading-relaxed shadow-2xs break-words relative group ${
            isMine ? 'bg-[#FF6B30] text-white' : 'bg-white text-slate-800 border border-slate-200/80'
          }`}
        >
          {/* Quoted Message Preview */}
          {m.replyTo && (
            <div className={`mb-2.5 p-2.5 rounded-xl text-xs font-medium border-l-3 ${
              isMine ? 'bg-black/15 border-white text-white/90' : 'bg-slate-50 border-[#FF6B30] text-slate-700'
            }`}>
              <div className="text-[11px] font-bold flex items-center gap-1 opacity-90">
                <CornerDownRight className="w-3.5 h-3.5" />
                <span>{getQuotedSenderName()}</span>
              </div>
              <p className="line-clamp-2 italic opacity-90 mt-0.5 leading-normal">{m.replyTo.content}</p>
            </div>
          )}

          <p className="whitespace-pre-wrap break-words text-left text-sm leading-relaxed">{m.content}</p>

          <button
            onClick={() => onReply(m)}
            className={`mt-2 text-xs font-bold flex items-center gap-1 transition ${
              isMine ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-medium mt-1 px-1">
          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
