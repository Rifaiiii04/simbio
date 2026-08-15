'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
}

export function GlowCard({ children, className = '' }: GlowCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, x: 2 }}
      transition={{ duration: 0.2 }}
      className={`neo-box p-6 sm:p-8 flex flex-col justify-between hover:shadow-[7px_7px_0px_0px_#0F172A] transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
}
