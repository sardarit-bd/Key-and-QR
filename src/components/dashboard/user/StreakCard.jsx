'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function StreakCard() {
  const { theme, colors } = useTheme();

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const streakDays = 7;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-[24px] p-6 shadow-lg flex flex-col items-center relative overflow-hidden"
      style={{
        backgroundColor: colors.backgroundSecondary,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-[50px]"></div>

      <h2 
        className="text-lg font-serif tracking-wide w-full text-center mb-8 relative z-10"
        style={{ color: colors.foreground }}
      >
        Inspiration Streak
      </h2>

      <div className="relative w-[250px] h-[250px] mb-6 z-10 flex items-center justify-center">
        <svg className="absolute rounded-full inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#FFD58A" />
              <stop offset="40%" stopColor="#FFB74D" />
              <stop offset="100%" stopColor="#C97A1A" />
            </linearGradient>
          </defs>

          {/* Outer glow */}
          <circle cx="50" cy="50" r="46" fill="none" stroke="#FFB347" strokeWidth="1" opacity="0.18" />
          
          {/* Background ring */}
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          
          {/* Progress ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="url(#streakGradient)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="289"
            strokeDashoffset="72"
          />
        </svg>

        <div className="flex flex-col items-center">
          <span className="font-serif text-[88px] leading-none text-[#F5C97A]">
            {streakDays}
          </span>
          <span className="mt-2 font-serif text-[22px] text-[#E9C27B]">
            Days
          </span>
        </div>
      </div>

      <p className="text-sm mb-6 relative z-10" style={{ color: colors.foregroundSecondary }}>
        Keep your streak going!
      </p>

      <div className="flex gap-2.5 sm:gap-4 relative z-10">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-medium" style={{ color: colors.foregroundTertiary }}>
              {day}
            </span>
            {i < 6 ? (
              <CheckCircle2 size={16} className="text-yellow-500" />
            ) : (
              <Circle size={16} style={{ color: colors.foregroundTertiary }} />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}