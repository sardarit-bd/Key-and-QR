'use client';

import { Heart, QrCode, Gift, Quote, Check } from 'lucide-react';
import StatCard from './StatCard';

const STATS_DATA = [
  {
    id: 'quotes',
    title: 'Total Quotes',
    value: '24',
    subtitle: 'Quotes received',
    colorTheme: 'purple',
    customIconRender: () => (
      <>
        <Quote size={20} className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-purple-400" />
        <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 bg-[#0e111a] rounded-full p-[1.5px] sm:p-[2px]">
          <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full border border-purple-500/30 bg-purple-900/80 flex items-center justify-center">
            <Check size={9} className="w-[7px] h-[7px] sm:w-[9px] sm:h-[9px] text-purple-400" strokeWidth={3} />
          </div>
        </div>
      </>
    )
  },
  {
    id: 'favorites',
    title: 'Favorites',
    value: '8',
    subtitle: 'Your favorite quotes',
    colorTheme: 'pink',
    icon: Heart
  },
  {
    id: 'scans',
    title: 'Total Scans',
    value: '15',
    subtitle: 'QR & NFC scans',
    colorTheme: 'blue',
    icon: QrCode
  },
  {
    id: 'gifted',
    title: 'Gifted Messages',
    value: '3',
    subtitle: 'Messages received',
    colorTheme: 'gold',
    icon: Gift
  }
];

export default function StatsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
      {STATS_DATA.map((stat) => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </div>
  );
}