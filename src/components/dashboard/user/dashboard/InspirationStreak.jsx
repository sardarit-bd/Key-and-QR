"use client";

import { Check } from "lucide-react";
import Card from "./Card";

export default function InspirationStreak({ streak }) {
 const current = streak?.current ?? 0;
 const longest = streak?.longest ?? 0;
 const weekActivity = streak?.weekActivity ?? [false, false, false, false, false, false, false];
 const weekDates = streak?.weekDates ?? [];

 // Calculate ring progress: 7-day weekly cycle
 // 0 days = 0%, 7 days = 100%
 const progressPercent = (Math.min(current, 7) / 7) * 100;

 // SVG circle geometry
 const radius = 82;
 const circumference = 2 * Math.PI * radius; // ~515.22
 const offset = circumference * (1 - progressPercent / 100);

 // Monday → Sunday labels
 const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

 // Weekday letter per entry, derived from the actual date when available.
 // Backend emits weekActivity as a rolling last-7-days window (oldest →
 // newest, ending today), so each entry's own date determines its label.
 const dayLabel = (dateStr, fallbackIndex) => {
   if (!dateStr) return DAYS[fallbackIndex] || '';
   const d = new Date(`${dateStr}T00:00:00Z`);
   if (Number.isNaN(d.getTime())) return DAYS[fallbackIndex] || '';
   const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // getUTCDay(): 0=Sun
   return WEEKDAY_LETTERS[d.getUTCDay()];
 };

 return (
 <Card className="relative overflow-hidden rounded-[26px] border border-accent/20 p-5 sm:p-6 h-full">
 <div className="relative z-10 flex h-full flex-col items-center justify-center">
 <h2 className="text-[28px] sm:text-[34px] text-foreground text-center">
 Inspiration Streak
 </h2>

 {/* Added scale-[0.85] sm:scale-100 to gracefully shrink the fixed 220px SVG on small mobile viewports */}
 <div className="relative mt-6 sm:mt-8 flex h-[220px] w-[220px] items-center justify-center scale-[0.85] sm:scale-100">
 <div className="absolute h-[170px] w-[170px] rounded-full bg-accent/20 blur-[20px]" />

 <div className="absolute h-[155px] w-[155px] rounded-full bg-card blur-[3px] z-20" />

 <svg
 className="absolute inset-0 -rotate-90 z-10"
 viewBox="0 0 220 220"
 >
 <defs>
 <filter
 id="eclipseGlow"
 x="-20%"
 y="-20%"
 width="140%"
 height="140%"
 >
 <feGaussianBlur stdDeviation="6" result="blur" />
 <feMerge>
 <feMergeNode in="blur" />
 <feMergeNode in="blur" />{" "}
 <feMergeNode in="SourceGraphic" />
 </feMerge>
 </filter>
 <linearGradient
 id="eclipseGradient"
 x1="100%"
 y1="50%"
 x2="0%"
 y2="50%"
 >
 <stop offset="0%" stopColor="#ffffff" />
 <stop offset="15%" stopColor="#ffb45d" />
 <stop offset="100%" stopColor="#7a4616" />
 </linearGradient>
 </defs>

 <circle
 cx="110"
 cy="110"
 r="82"
 fill="none"
 stroke="rgba(255,190,120,.10)"
 strokeWidth="1.5"
 />
 <circle
 cx="110"
 cy="110"
 r="82"
 fill="none"
 stroke="url(#eclipseGradient)"
 strokeWidth="2.5"
 strokeLinecap="round"
 strokeDasharray={circumference}
 strokeDashoffset={offset}
 filter="url(#eclipseGlow)"
 style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
 />
 <circle
 cx="192"
 cy="110"
 r="2.5"
 fill="#ffffff"
 filter="url(#eclipseGlow)"
 />
 </svg>

 {/* Center Text */}
 <div className="relative z-20 text-center">
 <h1 className=" text-[88px] leading-none text-accent drop-shadow-[0_0_12px_rgba(255,180,93,0.3)]">
 {current || 0}
 </h1>
 <p className="mt-2 text-[20px] text-accent drop-shadow-[0_0_8px_rgba(255,180,93,0.3)]">
 Days
 </p>
 </div>
 </div>

 <p className="mt-4 sm:mt-6 text-[18px] sm:text-[20px] text-foreground-secondary text-center">
 Keep your streak going!
 </p>

 {/* Adjusted mobile padding (px-3 py-3) for the days container */}
 <div className="mt-6 sm:mt-8 w-full rounded-[18px] bg-background-secondary/90 px-3 sm:px-5 py-3 sm:py-4">
 <div className="flex justify-between">
 {DAYS.map((day, i) => (
  <div key={i} className="flex flex-col items-center gap-2 sm:gap-3">
  <span className="text-xs sm:text-sm text-foreground-secondary">{dayLabel(weekDates[i], i)}</span>

 <div
 className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border ${
 weekActivity[i]
 ? "border-accent bg-accent"
 : "border-muted-foreground/30 bg-transparent"
 }`}
 >
 {weekActivity[i] && (
 <Check
 size={14}
 strokeWidth={3}
 className="text-accent-foreground w-3 h-3 sm:w-[14px] sm:h-[14px]"
 />
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </Card>
 );
}
