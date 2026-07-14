'use client';

import { motion } from 'framer-motion';
import { Quote, Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function WelcomeHeader({ greeting, userName, dailyQuote }) {
  const { theme, colors } = useTheme();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Welcome Text */}
      <div className="flex flex-col justify-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl lg:text-4xl font-serif flex items-center gap-2 mb-2"
          style={{ color: colors.foreground }}
        >
          {greeting}, {userName}! <span className="text-yellow-400">✨</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm lg:text-base"
          style={{ color: colors.foregroundSecondary }}
        >
          Welcome back to your inspiration journey.
        </motion.p>
      </div>

      {/* Daily Quote Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden p-6 lg:p-8 min-h-[220px] shadow-2xl flex flex-col justify-center"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15)`,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l from-yellow-500/10 via-transparent to-transparent z-0"></div>
        <div className="absolute right-[-10%] top-[-20%] w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] z-0"></div>

        <div className="relative z-10 max-w-[80%]">
          <Quote className="w-10 h-10 mb-4 opacity-20" style={{ color: colors.foreground }} />
          <p className="font-serif text-lg lg:text-xl italic mb-3 leading-relaxed" style={{ color: colors.foreground }}>
            "{dailyQuote?.text || 'Stay positive, work hard, make it happen.'}"
          </p>
          <p className="text-sm mb-6" style={{ color: colors.foregroundSecondary }}>
            — {dailyQuote?.author || 'InspireTag'}
          </p>

          <span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium backdrop-blur-sm border"
            style={{
              backgroundColor: `${colors.primary}20`,
              color: colors.primary,
              borderColor: `${colors.primary}30`,
            }}
          >
            <Sparkles size={14} />
            Your Daily Quote
          </span>
        </div>
      </motion.div>
    </div>
  );
}