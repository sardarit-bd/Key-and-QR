'use client';

import { Sparkles, Crown, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { SUBSCRIPTION_PLANS } from '@/config/sidebar.config';

/**
 * Icon mapping for upgrade card
 */
const ICON_MAP = {
  free: Sparkles,
  trial: Clock,
  expired: AlertCircle,
  premium: Crown,
  admin: Crown,
};

export default function SidebarUpgradeCard({ 
  isCollapsed, 
  config, 
  userPlan,
  shouldShow = true 
}) {
  // Don't show if config says not to show
  if (!shouldShow || !config) {
    return null;
  }

  const Icon = ICON_MAP[userPlan] || Sparkles;

  // Determine if this is an admin
  const isAdmin = userPlan === SUBSCRIPTION_PLANS.ADMIN;

  if (isCollapsed) {
    return (
      <div className="flex justify-center px-4 mt-6">
        <Link 
          href={config.ctaHref || '/subscription'} 
          className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#edb879] to-[#df9d56] flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label={config.title}
        >
          <Icon size={18} className="text-[#3c2510]" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-5 mt-6 mb-4 rounded-2xl p-5 bg-[#0e111a] border border-[#1a1e2d] relative">
      <div className="relative z-10 flex flex-col items-start text-left">
        <div className="flex items-start gap-3 mb-2">
          <Icon 
            size={20} 
            className="text-[#e3ba85] flex-shrink-0 mt-0.5" 
            fill="currentColor" 
          />
          <h4 className="font-serif text-[#e3ba85] text-[15px] leading-[1.3] tracking-wide">
            {config.title}
          </h4>
        </div>
        
        <p className="text-[13px] text-gray-400 mb-5 ml-8 leading-snug">
          {config.description}
        </p>
        
        <Link
          href={config.ctaHref || '/subscription'}
          className="w-full flex items-center justify-center py-2.5 bg-gradient-to-r from-[#f1c385] to-[#df9d56] text-[#3c2510] rounded-xl text-[14px] font-semibold hover:opacity-90 transition-opacity"
        >
          {config.ctaText}
        </Link>
      </div>
    </div>
  );
}