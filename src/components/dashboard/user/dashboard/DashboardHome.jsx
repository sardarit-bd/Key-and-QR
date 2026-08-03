'use client';

import { getCategoryStyle } from '@/utils/dashboard.utils';
import StatsSection from './StatsSection';
import InspirationStreak from './InspirationStreak';
import RecentQuotesCard from './RecentQuotesCard';
import CategorySection from './CategorySection';
import DailyQuoteBanner from './DailyQuoteBanner';
import WelcomeSection from './WelcomeSection';

function mapQuotes(quotes) {
  if (!Array.isArray(quotes)) return [];
  return quotes.map((q, i) => {
    const style = getCategoryStyle(q.category);
    return {
      id: q._id || i,
      title: q.text || 'No quote available',
      category: q.category || 'Motivation',
      date: q.scannedAt ? new Date(q.scannedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      icon: style.icon,
      colorClass: style.colorClass,
      bgClass: style.bgClass,
      badgeIcon: style.icon,
      badgeColor: style.colorClass,
    };
  });
}

export default function DashboardHome({ greeting, banner, recentQuotes, streak, statistics, categories, recentActivity, user, subscription }) {
  const quotes = mapQuotes(recentQuotes);

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      
      {/* Row 1: Welcome & Daily Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 min-h-[180px] sm:min-h-[200px] lg:min-h-[220px]">
        <WelcomeSection greeting={greeting} user={user} subscription={subscription} />
        <DailyQuoteBanner banner={banner} />
      </div>

      {/* Row 2: Categories */}
      <section>
        <CategorySection categories={categories} />
      </section>

      {/* Row 3: Recent Quotes & Streak */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <div className="xl:col-span-2">
          <RecentQuotesCard quotes={quotes} />
        </div>
        <div className="xl:col-span-1">
          <InspirationStreak streak={streak} />
        </div>
      </div>

      {/* Row 4: Statistics */}
      <section>
        <StatsSection statistics={statistics} />
      </section>
      
    </div>
  );
}
