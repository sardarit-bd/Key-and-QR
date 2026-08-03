'use client';

import { Calendar } from 'lucide-react';

export default function QuoteItem({ quote }) {
  const { title, category, date, icon: Icon, colorClass, bgClass, badgeIcon: BadgeIcon, badgeColor } = quote;

  return (
    <div className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-2xl bg-background-secondary/40 border border-white/6 hover:border-white/12 hover:bg-background-secondary/70 transition-all duration-300 hover:shadow-[0_8px_24px_-8px_rgb(0_0_0/0.5)]">
      <div className={`w-10 sm:w-11 h-10 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${bgClass}`}>
        {Icon ? (
          <Icon size={18} className={`w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] ${colorClass}`} fill="currentColor" />
        ) : (
          <BadgeIcon size={18} className={`w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] ${badgeColor}`} fill="currentColor" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-foreground text-[13px] sm:text-sm font-medium truncate">
          {title}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background-tertiary/50 text-[10px] md:text-[11px] font-medium border border-white/6">
          <BadgeIcon size={10} className={`w-[9px] h-[9px] md:w-[10px] md:h-[10px] ${badgeColor}`} />
          <span className={badgeColor}>{category}</span>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] sm:text-[11px] min-w-[72px] sm:min-w-[92px] md:min-w-[100px] justify-end">
          <Calendar size={12} className="w-[11px] h-[11px] sm:w-[12px] sm:h-[12px] opacity-70 flex-shrink-0" />
          <span className="truncate">{date}</span>
        </div>
      </div>
    </div>
  );
}
