'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getCandidateMessages,
  isCandidateChatLoading,
  sendSimbiConsultMessage,
  subscribeToSimbiChat,
  type Message,
} from '@/lib/simbi-chat-manager';

interface Candidate {
  user: { id: string; name: string };
}

const QUICK_PROMPTS = [
  'Is this candidate a good fit for me?',
  'Give me your overall assessment of this candidate',
  'What are the potential challenges in our skill swap?',
  'How should we structure our first learning session?',
];

interface Props {
  candidate: Candidate | null;
}

export function SimbiConsultPanel({ candidate }: Props) {
  const candidateId = candidate?.user?.id || '';
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshState = useCallback(() => {
    if (!candidateId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setMessages(getCandidateMessages(candidateId));
    setLoading(isCandidateChatLoading(candidateId));
  }, [candidateId]);

  // Synchronize on mount and candidate switch
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Subscribe to background updates from the global chat manager
  useEffect(() => {
    const unsubscribe = subscribeToSimbiChat((updatedCid) => {
      if (updatedCid === candidateId) {
        refreshState();
      }
    });
    return () => {
      unsubscribe();
    };
  }, [candidateId, refreshState]);

  // Auto-scroll on new messages or loading changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!candidateId || !text.trim() || loading) return;
    setInput('');
    // Non-blocking background request: user can navigate anywhere and it will continue
    sendSimbiConsultMessage(candidateId, text.trim());
  };

  const noCandidate = !candidate;

  return (
    <div className="flex flex-col h-full text-white">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-neutral-800/80 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[#FF6B30]/15 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-[#FF6B30]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-white leading-tight">Simbi AI Match Advisor</p>
          <p className="text-[10px] sm:text-xs text-neutral-400 font-medium truncate">
            {candidate ? `Evaluating compatibility with ${candidate.user.name}` : 'Select a candidate to start'}
          </p>
        </div>
        <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Online
        </span>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0 scrollbar-thin">
        {noCandidate ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-6">
            <Sparkles className="w-6 h-6 text-[#FF6B30]" />
            <p className="text-xs sm:text-sm font-bold text-neutral-300">Select a candidate on swap deck</p>
            <p className="text-[10px] sm:text-xs text-neutral-500 max-w-[240px]">
              Simbi is ready to evaluate your mutual skill synergy.
            </p>
          </div>
        ) : messages.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2.5 text-center py-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B30]/15 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#FF6B30]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">Hello! I am Simbi</p>
              <p className="text-[10px] sm:text-xs text-neutral-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                Ask me about your skill compatibility with <span className="font-bold text-[#FF6B30]">{candidate.user.name}</span>
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="shrink-0 pt-0.5">
                  {msg.role === 'user' ? (
                    <div className="w-6 h-6 rounded-full bg-[#FF6B30] flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-[#FF6B30]" />
                    </div>
                  )}
                </div>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed font-medium ${
                  msg.role === 'user'
                    ? 'bg-[#FF6B30] text-white rounded-tr-xs shadow-md shadow-[#FF6B30]/20'
                    : 'bg-[#18181B] border border-neutral-800 text-neutral-200 rounded-tl-xs'
                }`}>
                  {msg.role === 'simbi' ? (
                    <div className="prose prose-invert prose-sm max-w-none text-neutral-200 prose-p:my-1 prose-headings:text-white prose-strong:text-white">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {loading && (
          <div className="flex gap-2.5 items-center">
            <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-[#FF6B30]" />
            </div>
            <div className="bg-[#18181B] border border-neutral-800 rounded-2xl rounded-tl-xs px-3.5 py-2.5 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-[#FF6B30] animate-spin" />
              <span className="text-xs text-neutral-400 font-medium">Simbi is analyzing...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts — only when no messages yet & not loading */}
      {!noCandidate && messages.length === 0 && !loading && (
        <div className="shrink-0 grid grid-cols-2 gap-2 py-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-medium text-neutral-300 bg-[#18181B] hover:bg-[#27272A] hover:text-[#FF6B30] border border-neutral-800 hover:border-[#FF6B30]/40 rounded-xl px-3 py-2 text-left transition-all leading-snug cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="shrink-0 flex items-center gap-2 pt-3 border-t border-neutral-800/80">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
          placeholder={noCandidate ? 'Select candidate first...' : 'Ask Simbi about this candidate...'}
          disabled={noCandidate || loading}
          className="flex-1 text-xs sm:text-sm bg-[#18181B] text-white placeholder-neutral-500 rounded-xl px-3.5 sm:px-4 py-2.5 border border-neutral-800 font-medium focus:outline-none focus:border-[#FF6B30] focus:bg-[#202024] transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || noCandidate || loading}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FF6B30] disabled:bg-neutral-800 disabled:text-neutral-600 flex items-center justify-center hover:bg-[#E0531A] transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed text-white shadow-md shadow-[#FF6B30]/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
