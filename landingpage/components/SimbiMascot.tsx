import React from 'react';

export function SimbiMascot({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 120 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Capybara Ears */}
      <path d="M 25 40 Q 20 20 35 25 Z" fill="#E76F2F" />
      <path d="M 95 40 Q 100 20 85 25 Z" fill="#E76F2F" />
      
      {/* Capybara Head/Body (Squarish dome) */}
      <path 
        d="M 15 100 C 15 50, 25 35, 60 35 C 95 35, 105 50, 105 100 Z" 
        fill="#FF8042" 
      />
      
      {/* Snout area (slightly darker/lighter) */}
      <path 
        d="M 35 100 C 35 70, 45 65, 60 65 C 75 65, 85 70, 85 100 Z" 
        fill="#FF9A68" 
      />

      {/* Sleepy Eyes */}
      <path d="M 35 60 Q 40 55 45 60" stroke="#4A2B11" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M 75 60 Q 80 55 85 60" stroke="#4A2B11" strokeWidth="4" strokeLinecap="round" fill="none" />
      
      {/* Nose */}
      <ellipse cx="60" cy="72" rx="6" ry="4" fill="#4A2B11" />
      
      {/* Calm Mouth */}
      <path d="M 60 76 L 60 82" stroke="#4A2B11" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 52 82 Q 60 86 68 82" stroke="#4A2B11" strokeWidth="3" strokeLinecap="round" fill="none" />
      
    </svg>
  );
}
