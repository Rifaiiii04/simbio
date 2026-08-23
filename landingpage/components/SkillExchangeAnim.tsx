'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowLeftRight, Palette, Code, Languages, Music, TrendingUp, Camera } from 'lucide-react';

const pairs = [
  { left: { id: 'l1', label: 'UI Design', icon: Palette, color: 'bg-pink-100 text-pink-700 border-pink-200' }, right: { id: 'r1', label: 'React.js', icon: Code, color: 'bg-blue-100 text-blue-700 border-blue-200' } },
  { left: { id: 'l2', label: 'English', icon: Languages, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' }, right: { id: 'r2', label: 'Guitar', icon: Music, color: 'bg-amber-100 text-amber-700 border-amber-200' } },
  { left: { id: 'l3', label: 'Marketing', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }, right: { id: 'r3', label: 'Photo', icon: Camera, color: 'bg-purple-100 text-purple-700 border-purple-200' } },
];

export function SkillExchangeAnim() {
  const [index, setIndex] = useState(0);
  const [swapped, setSwapped] = useState(false);

  useEffect(() => {
    const cycle = setInterval(() => {
      setSwapped(true);
      setTimeout(() => {
        setSwapped(false);
        setIndex((prev) => (prev + 1) % pairs.length);
      }, 1500);
    }, 3500);

    return () => clearInterval(cycle);
  }, []);

  const currentPair = pairs[index];
  
  // Create an array where we can simply reverse it to trigger layout animation
  const items = swapped ? [currentPair.right, currentPair.left] : [currentPair.left, currentPair.right];

  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-4 w-full">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
      >
        Real-time Exchange
      </motion.div>
      
      <div className="relative flex items-center justify-between w-full max-w-[320px] sm:max-w-[380px] bg-white/40 backdrop-blur-xl border border-white/60 p-3 sm:p-4 rounded-[2rem] shadow-sm">
        
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm border shadow-sm flex items-center justify-center min-w-[120px] sm:min-w-[140px] z-0 ${item.color}`}
            >
              <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
              {item.label}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Center Swap Icon */}
        <motion.div 
          animate={{ rotate: swapped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-white shadow-lg border-4 border-[#FAF9F6]/40 z-10"
        >
          <ArrowLeftRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </motion.div>

      </div>
    </div>
  );
}
