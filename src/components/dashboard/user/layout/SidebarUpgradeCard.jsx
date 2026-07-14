'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SidebarUpgradeCard({ isCollapsed }) {
  if (isCollapsed) {
    return (
      <div className="flex justify-center px-4 mt-6">
        <Link href="/subscription" className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#edb879] to-[#df9d56] flex items-center justify-center">
          <Sparkles size={18} className="text-[#3c2510]" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-5 mt-6 mb-4 rounded-2xl p-5 bg-[#0e111a] border border-[#1a1e2d] relative">
      <div className="relative z-10 flex flex-col items-start text-left">
        <div className="flex items-start gap-3 mb-2">
          <Sparkles size={20} className="text-[#e3ba85] flex-shrink-0 mt-0.5" fill="currentColor" />
          <h4 className="font-serif text-[#e3ba85] text-[15px] leading-[1.3] tracking-wide">
            Unlock Unlimited<br />Inspiration
          </h4>
        </div>
        
        <p className="text-[13px] text-gray-400 mb-5 ml-8 leading-snug">
          Get unlimited quotes<br />and all categories.
        </p>
        
        <Link
          href="/subscription"
          className="w-full flex items-center justify-center py-2.5 bg-gradient-to-r from-[#f1c385] to-[#df9d56] text-[#3c2510] rounded-xl text-[14px] font-semibold hover:opacity-90 transition-opacity"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}