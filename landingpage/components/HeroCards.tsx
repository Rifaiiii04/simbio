'use client';

import { motion } from 'framer-motion';
import { SimbiMascot } from './SimbiMascot';

const cards = [
  {
    id: 1,
    text: "Why do I feel exhausted even after a full night's sleep?",
    answers: 16,
    views: 400,
    rotate: -8,
    yOffset: 30,
    zIndex: 10,
    avatar: "https://i.pravatar.cc/150?u=12",
    hasMascot: true,
  },
  {
    id: 2,
    text: "How do you stop overthinking small social interactions?",
    answers: 42,
    views: "1.2k",
    rotate: 0,
    yOffset: 0,
    zIndex: 20,
    avatar: "https://i.pravatar.cc/150?u=45",
  },
  {
    id: 3,
    text: "Is it normal to lose motivation for everything at once?",
    answers: 8,
    views: 150,
    rotate: 8,
    yOffset: 40,
    zIndex: 10,
    avatar: "https://i.pravatar.cc/150?u=31",
  }
];

export function HeroCards() {
  return (
    <div className="relative w-full max-w-4xl mx-auto h-[350px] mt-8 sm:mt-10 flex items-center justify-center pointer-events-none">
      
      {cards.map((card, i) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 150, rotate: card.rotate - 15 }}
          animate={{ opacity: 1, y: card.yOffset, rotate: card.rotate }}
          transition={{ duration: 0.8, delay: i * 0.15 + 0.3, type: "spring", bounce: 0.4 }}
          style={{ zIndex: card.zIndex }}
          className={`absolute w-[200px] sm:w-[260px] flex flex-col items-center text-center ${
            i === 0 ? '-translate-x-[85px] sm:-translate-x-[200px]' : 
            i === 2 ? 'translate-x-[85px] sm:translate-x-[200px]' : ''
          }`}
        >
          {card.hasMascot && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6, type: "spring", bounce: 0.5 }}
              className="absolute -top-[70px] sm:-top-[80px] left-1/2 -translate-x-[60%] -z-10"
            >
              <SimbiMascot className="w-20 h-20 sm:w-24 sm:h-24" />
            </motion.div>
          )}

          <div className="relative z-10 w-full h-[320px] sm:h-[380px] bg-white rounded-3xl p-5 sm:p-8 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100/50 flex flex-col items-center justify-start pt-6 sm:pt-10">
            <img 
              src={card.avatar} 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full mb-4 mx-auto object-cover border-2 border-white shadow-sm" 
            />
            <p className="font-display font-medium text-slate-800 text-[13px] sm:text-sm leading-relaxed mb-6 px-1">
              {card.text}
            </p>
            <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-semibold text-slate-400">
              <span>{card.answers} answers</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{card.views} views</span>
            </div>
          </div>
        </motion.div>
      ))}

    </div>
  );
}
