'use client';

import { Quote, Sparkles } from 'lucide-react';

export default function DailyQuoteBanner() {
  return (
    <div className="relative w-full h-full min-h-[200px] rounded-2xl overflow-hidden bg-[#11131a] border border-[#1e2235] flex items-center p-6 md:p-8 shadow-lg">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c14] via-[#0a0c14]/90 to-transparent z-10" />
      <div 
        className="absolute inset-0 bg-cover bg-right bg-no-repeat opacity-70 mix-blend-screen"
        style={{ backgroundImage: `url('/images/shell-placeholder.jpg')` }} // Replace with actual shell asset path
      />
      
      <div className="relative z-20 max-w-lg">
        <Quote size={20} className="text-[#e3ba85] mb-3 opacity-60" fill="currentColor" />
        <p className="text-xl md:text-2xl font-serif italic text-gray-200 mb-3 leading-snug">
          Stay positive, work hard,<br className="hidden sm:block" /> make it happen.
        </p>
        <p className="text-[#a1a1aa] text-sm mb-5">— InspireTag</p>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e3ba85]/10 border border-[#e3ba85]/20 text-[#e3ba85] text-xs font-medium">
          <Sparkles size={12} />
          Your Daily Quote
        </div>
      </div>
    </div>
  );
}