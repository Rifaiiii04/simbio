'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api/client';
import { Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';

interface Candidate {
  user: { id: string; name: string };
}

interface Message {
  role: 'user' | 'simbi';
  text: string;
}

const QUICK_PROMPTS = [
  'Is this candidate a good fit for me?',
  'Give me your overall assessment of this candidate',
  'What are the potential challenges in our skill swap?',
  'How should we structure our first learning session?',
];

// Simple markdown renderer: **bold** and newlines
function renderMarkdown(text: string) {
  return text.split('\n').map((line, li) => {
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return (
      <span key={li}>
        {li > 0 && <br />}
        {parts.map((part, i) =>
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        )}
      </span>
    );
  });
}

interface Props {
  candidate: Candidate | null;
}

export function SimbiConsultPanel({ candidate }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCandidateId = useRef<string | null>(null);

  // Reset chat when candidate changes
  useEffect(() => {
    if (candidate?.user.id !== prevCandidateId.current) {
      prevCandidateId.current = candidate?.user.id ?? null;
      setMessages([]);
    }
  }, [candidate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!candidate || !text.trim() || loading) return;
    const userMsg: Message = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiFetch<{ reply: string }>('/ai/simbi/match-consult', {
        method: 'POST',
        body: JSON.stringify({ candidateId: candidate.user.id, message: text }),
      });
      setMessages((prev) => [...prev, { role: 'simbi', text: res.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'simbi', text: 'Sorry, Simbi is temporarily unavailable. Please try again shortly.' }]);
    } finally {
      setLoading(false);
    }
  };

  const noCandidate = !candidate;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 shrink-0">
        <Bot className="w-5 h-5 text-[#FF6B30] shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-black text-slate-900 leading-tight">Simbi AI Match Advisor</p>
          <p className="text-[10px] text-slate-400 font-medium truncate">
            {candidate ? `Evaluating compatibility with ${candidate.user.name}` : 'Select a candidate card to start consultation'}
          </p>
        </div>
        <span className="ml-auto shrink-0 flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Online
        </span>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0 scrollbar-thin">
        {noCandidate ? (
          <div className="flex flex-col items-center justify-center h-full gap-2.5 text-center py-4">
            <Sparkles className="w-6 h-6 text-[#FF6B30]" />
            <p className="text-xs font-bold text-slate-600">Select a candidate on the swap deck</p>
            <p className="text-[10px] text-slate-400 max-w-[200px]">Simbi is ready to help evaluate your mutual skill synergy.</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2.5 text-center py-2">
            <Bot className="w-6 h-6 text-[#FF6B30]" />
            <div>
              <p className="text-xs font-black text-slate-700">Hello! I am Simbi</p>
              <p className="text-[10px] text-slate-400 mt-0.5 max-w-[200px] mx-auto leading-relaxed">
                Ask me about your skill compatibility with <span className="font-bold text-[#FF6B30]">{candidate.user.name}</span>
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="shrink-0 pt-0.5">
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-[#FF6B30]" />
                  ) : (
                    <Bot className="w-4 h-4 text-sky-600" />
                  )}
                </div>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed font-medium ${
                  msg.role === 'user'
                    ? 'bg-[#FF6B30] text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}>
                  {msg.role === 'simbi' ? renderMarkdown(msg.text) : msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {loading && (
          <div className="flex gap-2 items-center">
            <Bot className="w-4 h-4 text-[#FF6B30] shrink-0" />
            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-3 py-2 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 text-[#FF6B30] animate-spin" />
              <span className="text-[11px] text-slate-500 font-medium">Simbi is analyzing...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts — only when no messages yet */}
      {!noCandidate && messages.length === 0 && !loading && (
        <div className="shrink-0 grid grid-cols-2 gap-1.5 py-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="text-[10px] font-semibold text-slate-600 bg-slate-50 hover:bg-orange-50 hover:text-[#FF6B30] border border-slate-200 hover:border-orange-200 rounded-xl px-2 py-1.5 text-left transition-all leading-snug cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 flex items-center gap-2 pt-2 border-t border-slate-100">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder={noCandidate ? 'Select a candidate first...' : 'Ask Simbi about this candidate...'}
          disabled={noCandidate || loading}
          className="flex-1 text-[11px] bg-slate-50 rounded-2xl px-3 py-2 border border-slate-200 font-medium focus:outline-none focus:border-[#FF6B30] focus:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || noCandidate || loading}
          className="w-8 h-8 rounded-xl bg-[#FF6B30] disabled:bg-slate-200 flex items-center justify-center hover:bg-[#E0531A] transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  );
}
