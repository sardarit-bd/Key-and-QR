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
 className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center hover:brightness-105 transition-all"
 aria-label={config.title}
 >
 <Icon size={18} className="text-accent-foreground" />
 </Link>
 </div>
 );
 }

  return (
  <div className="mx-4 mt-6 mb-2 rounded-xl p-4 bg-sidebar-accent/50 border border-accent/10">
  <div className="flex flex-col items-start text-left">
  <div className="flex items-start gap-3 mb-2">
  <Icon 
  size={18} 
  className="text-accent flex-shrink-0 mt-0.5" 
  fill="currentColor" 
  />
  <h4 className="text-accent text-[14px] leading-[1.3] font-medium">
  {config.title}
  </h4>
  </div>
  
  <p className="text-[12px] text-foreground-secondary mb-4 ml-[30px] leading-snug">
  {config.description}
  </p>
  
  <Link
  href={config.ctaHref || '/subscription'}
  className="w-full flex items-center justify-center py-2 bg-accent text-accent-foreground rounded-lg text-[13px] font-semibold hover:brightness-105 transition-all duration-200 active:scale-[0.98]"
  >
  {config.ctaText}
  </Link>
  </div>
  </div>
  );
}
