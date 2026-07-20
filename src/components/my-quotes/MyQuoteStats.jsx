'use client';

import { Heart, Bookmark, Layers, Clock } from 'lucide-react';

/**
 * My Quote Stats
 * Display dynamic statistic cards
 */
export default function MyQuoteStats({ stats }) {
  const statConfig = [
    {
      label: 'Total Saved',
      value: stats?.total || 0,
      sub: 'All quotes',
      icon: Heart,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      label: 'Quotes',
      value: stats?.quotes || 0,
      sub: 'In your library',
      icon: Bookmark,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Categories',
      value: stats?.categories || 0,
      sub: 'Different themes',
      icon: Layers,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Recently Added',
      value: stats?.recentlyAdded || 0,
      sub: 'New quotes',
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statConfig.map((stat, idx) => (
        <div
          key={idx}
          className="bg-[#121526] border border-white/5 rounded-xl p-4 flex items-center gap-3 hover:border-white/10 transition-colors"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bg}`}>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
            <h3 className="text-xl font-bold text-white leading-none">{stat.value}</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}