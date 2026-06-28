'use client';

import { Sparkles, Heart, Quote as QuoteIcon } from 'lucide-react';
import StatsSection from './StatsSection';
import InspirationStreak from './InspirationStreak';
import RecentQuotesCard from './RecentQuotesCard';
import CategorySection from './CategorySection';
import DailyQuoteBanner from './DailyQuoteBanner';
import WelcomeSection from './WelcomeSection';

const MOCK_RECENT_QUOTES = [
  { 
    id: 1, 
    title: "Faith test quote Ochoa...", 
    category: "Faith", 
    date: "Jun 1, 2026", 
    icon: QuoteIcon, 
    colorClass: "text-purple-400", 
    bgClass: "bg-purple-900/20 border border-purple-500/20",
    badgeIcon: QuoteIcon,
    badgeColor: "text-purple-400" 
  },
  { 
    id: 2, 
    title: "Holden...", 
    category: "Motivation", 
    date: "May 27, 2026", 
    icon: Sparkles, 
    colorClass: "text-[#e3ba85]", 
    bgClass: "bg-[#e3ba85]/10 border border-[#e3ba85]/20",
    badgeIcon: Sparkles,
    badgeColor: "text-[#e3ba85]" 
  },
  { 
    id: 3, 
    title: "No quote available...", 
    category: "Motivation", 
    date: "May 19, 2026", 
    icon: Sparkles, 
    colorClass: "text-[#e3ba85]", 
    bgClass: "bg-[#e3ba85]/10 border border-[#e3ba85]/20",
    badgeIcon: Sparkles,
    badgeColor: "text-[#e3ba85]" 
  },
  { 
    id: 4, 
    title: "You know you're in love when...", 
    category: "Love", 
    date: "May 2, 2026", 
    icon: Heart, 
    colorClass: "text-pink-400", 
    bgClass: "bg-pink-900/20 border border-pink-500/20",
    badgeIcon: Heart,
    badgeColor: "text-pink-400" 
  },
  { 
    id: 5, 
    title: "If you want to know what a man's like...", 
    category: "Motivation", 
    date: "May 2, 2026", 
    icon: Sparkles, 
    colorClass: "text-[#e3ba85]", 
    bgClass: "bg-[#e3ba85]/10 border border-[#e3ba85]/20",
    badgeIcon: Sparkles,
    badgeColor: "text-[#e3ba85]" 
  },
];

export default function DashboardHome() {
  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      
      {/* Row 1: Welcome & Daily Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 min-h-[180px] sm:min-h-[200px] lg:min-h-[220px]">
        <WelcomeSection userName="Dd" />
        <DailyQuoteBanner />
      </div>

      {/* Row 2: Categories */}
      <section>
        <CategorySection />
      </section>

      {/* Row 3: Recent Quotes & Streak */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <div className="xl:col-span-2">
          <RecentQuotesCard quotes={MOCK_RECENT_QUOTES} />
        </div>
        <div className="xl:col-span-1">
          <InspirationStreak streak={7} />
        </div>
      </div>

      {/* Row 4: Statistics */}
      <section>
        <StatsSection />
      </section>
      
    </div>
  );
}