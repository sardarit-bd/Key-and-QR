'use client';

import { Scan, Calendar, Tag, Layers } from 'lucide-react';

/**
 * Scan History Stats
 */
export default function ScanHistoryStats({ stats, loading = false }) {
  const statConfig = [
    {
      label: 'Total Scans',
      value: stats?.totalScans || 0,
      sub: 'All time',
      icon: Scan,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Today',
      value: stats?.todayScans || 0,
      sub: 'Scans today',
      icon: Calendar,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Unique Tags',
      value: stats?.uniqueTags || 0,
      sub: 'Different tags',
      icon: Tag,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Categories',
      value: Object.keys(stats?.categoryDistribution || {}).length || 0,
      sub: 'Different themes',
      icon: Layers,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-[#121526] border border-white/5 rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800/50" />
              <div className="flex-1">
                <div className="h-3 bg-gray-800/50 rounded w-16" />
                <div className="h-5 bg-gray-800/50 rounded w-12 mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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