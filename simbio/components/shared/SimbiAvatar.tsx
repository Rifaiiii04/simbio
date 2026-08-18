'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, HeartHandshake, Timer, X } from 'lucide-react';

interface SimbiAvatarProps {
  state?: 'happy' | 'thinking' | 'cheering' | 'working';
  message?: string;
  className?: string;
}

export function SimbiAvatar({ state = 'happy', message, className = '' }: SimbiAvatarProps) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    const isDismissed = localStorage.getItem('simbi_tips_dismissed');
    setDismissed(isDismissed === 'true');
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('simbi_tips_dismissed', 'true');
    setDismissed(true);
  };

  const renderBadgeIcon = () => {
    switch (state) {
      case 'thinking':
        return <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />;
      case 'cheering':
        return <Sparkles className="w-4 h-4 text-[#FF6B30]" />;
      case 'working':
        return <Timer className="w-4 h-4 text-sky-600" />;
      default:
        return <HeartHandshake className="w-4 h-4 text-rose-500" />;
    }
  };

  // If tips have been dismissed by the user, return null (never show again)
  if (dismissed === null || dismissed === true) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className={`fixed bottom-6 right-6 z-50 max-w-sm w-full soft-card p-4.5 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl rounded-3xl ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            {/* Capybara Mascot Avatar */}
            <div className="relative flex-shrink-0">
              <motion.div
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-13 h-13 rounded-2xl bg-orange-100/80 border border-orange-200 shadow-2xs flex items-center justify-center overflow-hidden"
              >
                <svg className="w-10 h-10 text-[#FF6B30]" viewBox="0 0 64 64" fill="currentColor">
                  <path d="M12 36C12 24 20 16 32 16C44 16 52 24 52 36C52 46 44 52 32 52C20 52 12 46 12 36Z" fill="#C87D46" stroke="#0F172A" strokeWidth="2" />
                  <path d="M18 28C18 24 24 20 32 20C40 20 46 24 46 28V36C46 42 40 46 32 46C24 46 18 42 18 36V28Z" fill="#B36A36" />
                  <rect x="22" y="34" width="20" height="12" rx="6" fill="#8C4D20" stroke="#0F172A" strokeWidth="1.5" />
                  <circle cx="28" cy="38" r="2" fill="#0F172A" />
                  <circle cx="36" cy="38" r="2" fill="#0F172A" />
                  <circle cx="22" cy="28" r="3" fill="#0F172A" />
                  <circle cx="42" cy="28" r="3" fill="#0F172A" />
                  <circle cx="14" cy="18" r="4" fill="#8C4D20" stroke="#0F172A" strokeWidth="1.5" />
                  <circle cx="50" cy="18" r="4" fill="#8C4D20" stroke="#0F172A" strokeWidth="1.5" />
                  {/* Signature Yuzu Citrus Hat */}
                  <circle cx="32" cy="12" r="5" fill="#FF6B30" stroke="#0F172A" strokeWidth="1.5" />
                  <path d="M32 7 Q34 9 33 10" stroke="#10B981" strokeWidth="2" fill="none" />
                </svg>
              </motion.div>

              <span className="absolute -bottom-1 -right-1 p-1 bg-amber-50 rounded-lg border border-amber-200 shadow-2xs flex items-center justify-center">
                {renderBadgeIcon()}
              </span>
            </div>

            {/* Speech Content */}
            <div className="space-y-1">
              <div className="font-black text-[#FF6B30] text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <span>Simbi Capybara</span>
                <span className="text-[10px] text-slate-400 font-semibold">• Tips Companion</span>
              </div>
              {message && <p className="text-xs font-medium text-slate-700 leading-relaxed">{message}</p>}
            </div>
          </div>

          {/* Close / Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition shrink-0"
            title="Tutup & jangan tampilkan lagi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
