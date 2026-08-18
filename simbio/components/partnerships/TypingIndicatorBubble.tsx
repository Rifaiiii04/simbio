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
          <div className="w-8 h-8 rounded-xl bg-[#06B6D4] border-2 border-[#0F172A] text-white font-black flex items-center justify-center text-xs flex-shrink-0 shadow-[1.5px_1.5px_0px_0px_#0F172A]">
            <Sparkles className="w-4 h-4 text-white animate-spin" />
          </div>
          <div className="p-3 rounded-2xl bg-[#ECFEFF] text-[#06B6D4] border-2 border-[#0F172A] text-xs font-black flex items-center gap-2 shadow-[2.5px_2.5px_0px_0px_#06B6D4]">
            <span>Simbi AI sedang berpikir dan mengetik balasan...</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        </div>
      )}

      {/* 2. Partner Typing Bubble */}
      {isPartnerTyping && partnerName && (
        <div className="flex gap-2.5 items-center w-full animate-fadeIn">
          <div className="w-8 h-8 rounded-xl bg-[#FF7A30] border-2 border-[#0F172A] text-white font-black flex items-center justify-center text-xs flex-shrink-0 shadow-[1.5px_1.5px_0px_0px_#0F172A]">
            {partnerName.charAt(0)}
          </div>
          <div className="p-3 rounded-2xl bg-white text-[#0F172A] border-2 border-[#0F172A] text-xs font-black flex items-center gap-2 shadow-[2.5px_2.5px_0px_0px_#0F172A]">
            <MessageSquare className="w-3.5 h-3.5 text-[#FF7A30]" />
            <span>{partnerName} sedang mengetik...</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A30] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A30] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A30] animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
