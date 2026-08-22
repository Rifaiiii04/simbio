'use client';

import React, { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export interface ScrollStackItemProps {
  children: ReactNode;
  itemClassName?: string;
  index?: number;
  total?: number;
  progress?: any;
}

export const ScrollStackItem = ({ 
  children, 
  itemClassName = '', 
  index = 0, 
  total = 1,
  progress 
}: ScrollStackItemProps) => {
  
  // Calculate when this specific card should start and stop sliding in
  // Card 0 doesn't slide, it's always there.
  // Card 1 slides in from 0 to 0.5 (if 3 cards).
  // Card 2 slides in from 0.5 to 1.0.
  const slideStart = index === 0 ? 0 : (index - 1) / (total - 1);
  const slideEnd = index === 0 ? 0 : index / (total - 1);

  // The y-axis animation
  // Starts offscreen at 100vh, ends at its stacked offset (e.g., 0px, 30px, 60px)
  const y = useTransform(
    progress,
    [slideStart, slideEnd],
    [index === 0 ? '0vh' : '100vh', `${index * 3}vh`]
  );

  // The scale animation
  // A card only starts shrinking AFTER it has fully slid in (scaleStart = slideEnd)
  const scaleStart = slideEnd;
  const targetScale = 1 - ((total - 1 - index) * 0.04); // e.g. Card 0 goes down to 0.92
  
  const scale = useTransform(
    progress,
    [scaleStart, 1],
    [1, targetScale]
  );

  // Smooth the animations slightly so they feel buttery and don't jitter on mouse wheel steps
  const smoothY = useSpring(y, { stiffness: 300, damping: 30, restDelta: 0.001 });
  const smoothScale = useSpring(scale, { stiffness: 300, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className={`absolute w-full origin-top will-change-transform ${itemClassName}`.trim()}
      style={{
        y: smoothY,
        scale: smoothScale,
        top: '10vh', // Base offset from the top of the viewport
        zIndex: index,
      }}
    >
      <div className="bg-gradient-to-br from-[#FF5A00] to-[#FF9F00] rounded-[40px] border border-orange-400/50 overflow-hidden w-full h-full p-6 md:p-12 shadow-[0_12px_40px_-12px_rgba(255,90,0,0.4)] relative">
        {/* Subtle top inner glow for 3D effect */}
        <div className="absolute inset-0 rounded-[40px] border-t border-white/40 pointer-events-none" />
        {children}
      </div>
    </motion.div>
  );
};

export interface ScrollStackProps {
  children: ReactNode;
  className?: string;
  // Legacy props kept to avoid breaking FeatureShowcase if it passes them
  useWindowScroll?: boolean;
  itemDistance?: number;
  itemStackDistance?: number;
  stackPosition?: string;
}

const ScrollStack = ({
  children,
  className = '',
}: ScrollStackProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const childrenArray = React.Children.toArray(children);
  const total = childrenArray.length;

  // We track the scroll progress of this container.
  // By making the container very tall (e.g., 300vh), the user has to scroll for a long time,
  // which drives the progress from 0 to 1 smoothly.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    // The container height is proportional to the number of cards.
    // 3 cards = 300vh. This gives 100vh of scrolling distance per card.
    <div 
      ref={containerRef} 
      className={`relative w-full ${className}`} 
      style={{ height: `${total * 100}vh` }}
    >
      {/* 
        The sticky viewport. 
        It locks to the top of the screen and stays there while the user scrolls through the 300vh container.
      */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {childrenArray.map((child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              index,
              total,
              progress: scrollYProgress,
            } as any);
          }
          return child;
        })}
      </div>
    </div>
  );
};

export default ScrollStack;
