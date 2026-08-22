'use client';

import FallingText from './ui/FallingText';
import { motion } from 'framer-motion';

export function UsecaseSection() {
  const text = "Learning alone is boring, expensive, and frustrating. Experience free reciprocal skill exchange.";
  
  const fallingWords = [
    "alone", 
    "boring", 
    "expensive",
    "and",
    "frustrating"
  ];

  return (
    <section id="usecases" className="pt-16 pb-4 relative overflow-hidden bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: '-50px' }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center"
      >
        
        <FallingText
          text={text}
          fallingWords={fallingWords}
          trigger="hover"
          backgroundColor="transparent"
          gravity={0.6}
          fontSize="2.5rem"
          mouseConstraintStiffness={0.9}
        />

      </motion.div>
    </section>
  );
}
