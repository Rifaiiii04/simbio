'use client';

import FallingText from './ui/FallingText';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function UsecaseSection() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const text = "Learning alone is boring, expensive, and frustrating. Experience free reciprocal skill exchange.";
  
  const fallingWords = [
    "alone", 
    "boring", 
    "expensive",
    "and",
    "frustrating"
  ];

  return (
    <section id="usecases" className="pt-20 pb-12 relative overflow-hidden bg-[#F8FAFC]">
      {/* Subtle Dot Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: '-50px' }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center text-center space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/50 text-orange-600 text-xs font-bold uppercase tracking-widest border border-orange-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          The Old Way of Learning
        </div>

        <FallingText
          text={text}
          fallingWords={fallingWords}
          trigger="hover"
          backgroundColor="transparent"
          gravity={0.6}
          fontSize={isMobile ? "1.6rem" : "2.5rem"}
          mouseConstraintStiffness={0.9}
        />

      </motion.div>
    </section>
  );
}
