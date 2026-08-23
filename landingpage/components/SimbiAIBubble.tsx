'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const messages = [
  "Hi, I'm Simbi!",
  "What do you want to learn today?",
  "Finding your perfect match...",
  "Let's master a new skill!"
];

export function SimbiAIBubble() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const cycle = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(cycle);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1, duration: 0.6, type: "spring" }}
      className="absolute right-4 sm:right-10 lg:right-[15%] top-[20%] sm:top-[30%] z-20 pointer-events-none hidden sm:flex flex-col items-end gap-2"
    >
      {/* The Bubble */}
      <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl rounded-br-sm p-4 max-w-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed"
          >
            {messages[index]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* The Avatar */}
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 shadow-lg flex items-center justify-center border-[3px] border-[#FAF9F6]"
      >
        <Sparkles className="w-5 h-5 text-white animate-pulse" />
      </motion.div>
    </motion.div>
  );
}
