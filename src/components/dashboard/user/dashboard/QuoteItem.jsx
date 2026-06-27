'use client';

import { Calendar } from 'lucide-react';

export default function QuoteItem({ quote }) {
  const { title, category, date, icon: Icon, colorClass, bgClass, badgeIcon: BadgeIcon, badgeColor } = quote;

  return (
    <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#12141d] border border-[#1a1e2d] hover:bg-[#161925] transition-colors group">
      {/* Icon Box */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bgClass}`}>
        <Icon size={18} className={colorClass} fill="currentColor" />
      </div>
      
      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="text-gray-200 text-sm font-medium truncate">{title}</p>
      </div>
      
      {/* Meta Data */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Category Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1a1e2d] text-[11px] font-medium hidden sm:flex border border-[#2a2e40]">
          <BadgeIcon size={10} className={badgeColor} />
          <span className={badgeColor}>{category}</span>
        </div>
        
        {/* Date */}
        <div className="flex items-center gap-1.5 text-gray-500 text-[11px] sm:w-28 justify-end">
          <Calendar size={12} className="opacity-70" />
          {date}
        </div>
      </div>
    </div>
  );
}