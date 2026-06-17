import React from 'react';

export const BackgroundBlobs: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Top-Left Organic Corner Blob */}
      <svg viewBox="0 0 300 800" preserveAspectRatio="none" className="absolute top-0 left-0 h-[80vh] w-[14vw] max-w-[200px] min-w-[80px] text-indigo-100/40 dark:text-[#1c223c] opacity-80 dark:opacity-90 fill-current transition-all duration-500">
        <path d="M 0,0 
                 C 120,80 220,180 200,320 
                 C 180,460 80,550 50,680 
                 C 30,760 15,800 0,800 Z" />
      </svg>
      {/* Top-Right Organic Corner Blob */}
      <svg viewBox="0 0 300 400" preserveAspectRatio="none" className="absolute top-0 right-0 h-[45vh] w-[20vw] min-w-[150px] text-indigo-100/40 dark:text-[#1c223c] opacity-80 dark:opacity-90 fill-current transition-all duration-500">
        <path d="M 300,0 
                 L 100,0 
                 C 140,80 180,120 200,200 
                 C 220,280 260,320 300,350 Z" />
      </svg>
      {/* Secondary Top-Right Small Blob */}
      <svg viewBox="0 0 200 200" className="absolute top-[26vh] right-[-40px] w-[120px] h-[120px] md:w-[160px] md:h-[160px] text-indigo-100/30 dark:text-[#1c223c]/80 fill-current transition-all duration-500">
        <circle cx="100" cy="100" r="100" />
      </svg>
    </div>
  );
};

export default BackgroundBlobs;

