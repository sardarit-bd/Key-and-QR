'use client';

import { Check } from 'lucide-react';
import Card from './Card';

const DAYS = [
  { day: 'M', active: true },
  { day: 'T', active: true },
  { day: 'W', active: true },
  { day: 'T', active: true },
  { day: 'F', active: true },
  { day: 'S', active: true },
  { day: 'S', active: false },
];

export default function InspirationStreak({ streak = 7 }) {
  return (
    <Card className="p-6 h-full flex flex-col items-center justify-between">
      <h2 className="text-xl font-serif text-white mb-6 self-start w-full text-center">Inspiration Streak</h2>
      
      {/* Glowing Circular Progress */}
      <div className="relative w-44 h-44 flex items-center justify-center my-4">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          {/* Background Track */}
          <circle 
            cx="88" cy="88" r="80" 
            stroke="#e3ba85" strokeWidth="2" fill="none" 
            strokeOpacity="0.15" 
          />
          {/* Active Progress (with glow via filter) */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle 
            cx="88" cy="88" r="80" 
            stroke="#e3ba85" strokeWidth="3" fill="none" 
            strokeDasharray="502" strokeDashoffset="100" // Adjust offset for progress
            strokeLinecap="round"
            filter="url(#glow)"
          />
        </svg>
        
        <div className="text-center z-10 flex flex-col items-center">
          <span className="text-6xl font-serif text-[#e3ba85] leading-none mb-1">{streak}</span>
          <span className="text-[#a1a1aa] text-[11px] tracking-[0.2em] uppercase font-medium">Days</span>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mb-6 font-medium">Keep your streak going!</p>
      
      {/* Day Checklist */}
      <div className="flex items-center justify-between w-full px-2 mt-auto">
        {DAYS.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-gray-500 text-xs font-semibold">{item.day}</span>
            <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center border ${
              item.active 
                ? 'bg-gradient-to-br from-[#e3ba85] to-[#c79c63] border-transparent shadow-[0_0_8px_rgba(227,186,133,0.4)]' 
                : 'bg-transparent border-[#2a2e40]'
            }`}>
              {item.active && <Check size={12} className="text-[#070911]" strokeWidth={3.5} />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}