'use client';

import { Crown, Mail, Globe, Apple, ShieldCheck } from 'lucide-react';

/**
 * ProfileBadge — small pill badge used across the profile page.
 * Renders a consistent premium pill with an optional icon.
 */
export default function ProfileBadge({
  icon: Icon,
  children,
  tone = 'neutral',
  className = '',
}) {
  const tones = {
    neutral: 'border-white/10 bg-background-secondary/60 text-foreground-secondary',
    accent: 'border-accent/30 bg-accent/10 text-accent',
    premium: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    admin: 'border-purple-500/40 bg-purple-500/15 text-purple-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium backdrop-blur-md ${tones[tone] || tones.neutral} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}

/**
 * ProviderBadge — shows which account provider the user signed up with.
 * Only reflects the existing single `provider` field (local | google | apple) —
 * no auth changes.
 */
export function ProviderBadge({ provider, className = '' }) {
  const p = provider || 'local';

  if (p === 'google') {
    return (
      <ProfileBadge icon={Globe} tone="blue" className={className}>
        Google Account
      </ProfileBadge>
    );
  }
  if (p === 'apple') {
    return (
      <ProfileBadge icon={Apple} tone="neutral" className={className}>
        Apple Account
      </ProfileBadge>
    );
  }
  return (
    <ProfileBadge icon={Mail} tone="green" className={className}>
      Email Account
    </ProfileBadge>
  );
}

/**
 * MembershipBadge — reflects subscription/membership tier using the
 * existing user fields. No backend changes.
 */
export function MembershipBadge({ isPremium, isAdmin, className = '' }) {
  if (isAdmin) {
    return (
      <ProfileBadge icon={ShieldCheck} tone="admin" className={className}>
        Administrator
      </ProfileBadge>
    );
  }
  if (isPremium) {
    return (
      <ProfileBadge icon={Crown} tone="premium" className={className}>
        Premium Member
      </ProfileBadge>
    );
  }
  return (
    <ProfileBadge className={className}>
      Free Member
    </ProfileBadge>
  );
}
