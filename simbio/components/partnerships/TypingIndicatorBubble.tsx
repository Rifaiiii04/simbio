'use client';

import { Sparkles, MessageSquare } from 'lucide-react';

interface TypingIndicatorBubbleProps {
  isSimbiAiTyping?: boolean;
  isPartnerTyping?: boolean;
  partnerName?: string;
}

export function TypingIndicatorBubble({
  isSimbiAiTyping,
  isPartnerTyping,
  partnerName,
}: TypingIndicatorBubbleProps) {
  if (!isSimbiAiTyping && !isPartnerTyping) return null;

  return (
    <div className="space-y-2 py-1">
      {/* 1. Simbi AI Typing Bubble */}
      {isSimbiAiTyping && (
        <div className="flex gap-2.5 items-center w-full animate-fadeIn">
          <div className="w-8 h-8 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-white animate-spin" />
          </div>
          <div className="p-3 rounded-2xl bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-2 shadow-xs">
            <span>Simbi AI sedang berpikir dan mengetik balasan...</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        </div>
      )}

      {/* 2. Partner Typing Bubble */}
      {isPartnerTyping && partnerName && (
        <div className="flex gap-2.5 items-center w-full animate-fadeIn">
          <div className="w-8 h-8 rounded-xl bg-[#FF6B30] text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
            {partnerName.charAt(0)}
          </div>
          <div className="p-3 rounded-2xl bg-white text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-2 shadow-xs">
            <MessageSquare className="w-3.5 h-3.5 text-[#FF6B30]" />
            <span>{partnerName} sedang mengetik...</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B30] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B30] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B30] animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
