'use client';

import React, { useState, useEffect } from 'react';
import { UserX, X, Send, Loader2, Sparkles } from 'lucide-react';

interface EndExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onConfirm: (message: string) => Promise<void>;
  loading?: boolean;
}

export const APOLOGY_TEMPLATES = [
  {
    id: 'schedule',
    title: 'Schedule Conflict',
    text: (partnerName: string) =>
      `Hi ${partnerName}, thank you so much for the knowledge swap and study sessions. Unfortunately, my current schedule has become very busy and I won't be able to continue our study sessions. I apologize for having to end our exchange and wish you all the best in your learning journey!`,
  },
  {
    id: 'goals',
    title: 'Goals Reached',
    text: (partnerName: string) =>
      `Hi ${partnerName}, I really appreciate your time and all the help you've provided. I have reached my milestone objectives for this skill, so I will be wrapping up our exchange. Thank you again and good luck with your goals!`,
  },
  {
    id: 'farewell',
    title: 'Polite Farewell',
    text: (partnerName: string) =>
      `Hi ${partnerName}, thank you for being a wonderful learning partner. I need to take a break from skill exchange at this time. I apologize for any inconvenience, and thank you for your patience and collaboration!`,
  },
];

export function EndExchangeModal({
  isOpen,
  onClose,
  partnerName,
  onConfirm,
  loading = false,
}: EndExchangeModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('schedule');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen && partnerName) {
      const defaultTemplate = APOLOGY_TEMPLATES[0];
      setSelectedTemplateId(defaultTemplate.id);
      setMessage(defaultTemplate.text(partnerName));
    }
  }, [isOpen, partnerName]);

  if (!isOpen) return null;

  const handleSelectTemplate = (template: (typeof APOLOGY_TEMPLATES)[0]) => {
    setSelectedTemplateId(template.id);
    setMessage(template.text(partnerName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    await onConfirm(message.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shadow-2xs shrink-0">
              <UserX className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">End Skill Exchange</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Closing exchange with {partnerName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer hover:bg-slate-50 disabled:opacity-50"
            title="Close dialog"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
            Please send a polite farewell or apology note to <span className="font-bold text-slate-900">{partnerName}</span> before concluding this partnership.
          </p>

          {/* Quick Template Chips */}
          <div className="space-y-1.5">
            <label className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FF6B30]" />
              <span>Quick Message Templates (Editable):</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {APOLOGY_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`text-[10px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-bold border transition cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-[#FF6B30] text-white border-[#FF6B30]'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {tmpl.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="departure-message" className="text-[11px] sm:text-xs font-bold text-slate-700">
                Departure Message Note
              </label>
              <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-medium">
                {message.length} characters
              </span>
            </div>
            <textarea
              id="departure-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setSelectedTemplateId('');
              }}
              rows={4}
              required
              placeholder="Write your farewell note here..."
              className="w-full p-2.5 sm:p-3 text-[11px] sm:text-xs bg-slate-50 border border-slate-200 rounded-2xl font-normal text-slate-800 focus:outline-hidden focus:border-[#FF6B30] focus:bg-white transition leading-relaxed resize-none"
            />
          </div>

          {/* Dialog Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full py-2 sm:py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-[11px] sm:text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="w-full py-2 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Ending Exchange...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send & End Exchange</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
