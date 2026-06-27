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
    // Custom render for the compound Quote + Check icon in the design
    customIconRender: () => (
      <>
        <Quote size={20} className="text-purple-400" />
        <div className="absolute -bottom-1 -right-1 bg-[#0e111a] rounded-full p-[2px]">
          <div className="w-4 h-4 rounded-full border border-purple-500/30 bg-purple-900/80 flex items-center justify-center">
            <Check size={9} className="text-purple-400" strokeWidth={3} />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {STATS_DATA.map((stat) => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </div>
  );
}