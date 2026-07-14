'use client';

import { Calendar } from 'lucide-react';

export default function QuoteItem({ quote }) {
  const { title, category, date, icon: Icon, colorClass, bgClass, badgeIcon: BadgeIcon, badgeColor } = quote;

  return (
    <div className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 md:p-3.5 rounded-xl bg-[#12141d] border border-[#1a1e2d] hover:bg-[#161925] transition-colors group">
      <div className={`w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bgClass}`}>
        <Icon size={18} className={`w-[15px] h-[15px] sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] ${colorClass}`} fill="currentColor" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-gray-200 text-xs sm:text-sm font-medium truncate">{title}</p>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md bg-[#1a1e2d] text-[10px] md:text-[11px] font-medium border border-[#2a2e40]">
          <BadgeIcon size={10} className={`w-[8px] h-[8px] md:w-[10px] md:h-[10px] ${badgeColor}`} />
          <span className={badgeColor}>{category}</span>
        </div>
        
        <div className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-[11px] min-w-[70px] sm:min-w-[90px] md:min-w-[100px] justify-end">
          <Calendar size={12} className="w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] opacity-70 flex-shrink-0" />
          <span className="truncate">{date}</span>
        </div>
      </div>
    </div>
  );
}