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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`soft-card p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
}
