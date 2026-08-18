'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, HeartHandshake, Timer } from 'lucide-react';

interface SimbiAvatarProps {
  state?: 'happy' | 'thinking' | 'cheering' | 'working';
  message?: string;
  className?: string;
}

export function SimbiAvatar({ state = 'happy', message, className = '' }: SimbiAvatarProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`soft-card p-4 flex items-start gap-4 bg-white border border-slate-200/80 shadow-xs ${className}`}
    >
      {/* Capybara Avatar */}
      <div className="relative flex-shrink-0">
        <motion.div
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-14 h-14 rounded-2xl bg-orange-100/80 border border-orange-200 shadow-2xs flex items-center justify-center overflow-hidden"
        >
          <svg className="w-11 h-11 text-[#FF6B30]" viewBox="0 0 64 64" fill="currentColor">
            <path d="M12 36C12 24 20 16 32 16C44 16 52 24 52 36C52 46 44 52 32 52C20 52 12 46 12 36Z" fill="#C87D46" stroke="#0F172A" strokeWidth="2" />
            <path d="M18 28C18 24 24 20 32 20C40 20 46 24 46 28V36C46 42 40 46 32 46C24 46 18 42 18 36V28Z" fill="#B36A36" />
            <rect x="22" y="34" width="20" height="12" rx="6" fill="#8C4D20" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="28" cy="38" r="2" fill="#0F172A" />
            <circle cx="36" cy="38" r="2" fill="#0F172A" />
            <circle cx="22" cy="28" r="3" fill="#0F172A" />
            <circle cx="42" cy="28" r="3" fill="#0F172A" />
            <circle cx="14" cy="18" r="4" fill="#8C4D20" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="50" cy="18" r="4" fill="#8C4D20" stroke="#0F172A" strokeWidth="1.5" />
            {/* Signature Yuzu Citrus Hat! */}
            <circle cx="32" cy="12" r="5" fill="#FF6B30" stroke="#0F172A" strokeWidth="1.5" />
            <path d="M32 7 Q34 9 33 10" stroke="#10B981" strokeWidth="2" fill="none" />
          </svg>
        </motion.div>

        <span className="absolute -bottom-1 -right-1 p-1 bg-amber-50 rounded-lg border border-amber-200 shadow-2xs flex items-center justify-center">
          {renderBadgeIcon()}
        </span>
      </div>

      {/* Speech Bubble */}
      {message && (
        <div className="flex-1 text-xs sm:text-sm text-slate-800 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 shadow-2xs relative">
          <div className="font-bold text-[#FF6B30] text-xs mb-1 flex items-center gap-1.5 uppercase tracking-wider">
            <span>Simbi Capybara</span>
            <span className="text-[10px] text-slate-400 font-semibold">• AI Companion</span>
          </div>
          <p className="font-medium leading-relaxed text-slate-700">{message}</p>
        </div>
      )}
    </motion.div>
  );
}
