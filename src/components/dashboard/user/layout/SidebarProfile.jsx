'use client';

import { Crown } from 'lucide-react';

export default function SidebarProfile({ profile, isCollapsed }) {
  const hasAvatar = profile?.avatar;

  if (isCollapsed) {
    return (
      <div className="flex justify-center px-4 mb-6">
        <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-lg ring-1 ring-accent/40 shadow-[0_0_15px_rgba(227,186,133,0.15)] overflow-hidden">
          {hasAvatar ? (
            <img
              src={hasAvatar}
              alt={profile.name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            profile.initials
          )}
          {profile.plan === 'premium' && (
            <div className="absolute -top-1 -right-1">
              <Crown className="w-3.5 h-3.5 text-accent" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-background-secondary/60 border border-white/6 rounded-[24px] mb-6 mx-5 overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(253,182,92,0.06),transparent_70%)]" />

      {/* Avatar */}
      <div className="relative flex-shrink-0 mb-4 z-10">
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-primary/30 to-accent/20 blur-md" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-primary via-primary/80 to-primary/60 flex items-center justify-center text-primary-foreground text-[32px] ring-1 ring-white/10 shadow-[0_0_24px_rgba(168,85,247,0.25)] overflow-hidden">
          {hasAvatar ? (
            <img
              src={hasAvatar}
              alt={profile.name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            profile.initials
          )}
        </div>
        {profile.plan === 'premium' && (
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-accent/40 bg-background shadow-[0_0_14px_rgba(253,182,92,0.3)]">
            <Crown className="w-3.5 h-3.5 text-accent" />
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex flex-col items-center z-10">
        <h3 className="text-[16px] font-semibold text-foreground tracking-wide mb-1">
          {profile.name}
        </h3>
        <p className="text-[12px] text-foreground-secondary mb-2">
          {profile.email}
        </p>

        {/* Member Since */}
        {profile.memberSince && (
          <p className="text-[11px] text-foreground-tertiary mb-3">
            Member since {profile.memberSince}
          </p>
        )}

        {/* Subscription Badge */}
        <div className={`px-4 py-1.5 rounded-full bg-background-tertiary/50 border ${profile.borderColor || 'border-white/8'}`}>
          <span className={`text-[12px] font-medium ${profile.badgeColor || 'text-foreground-secondary'}`}>
            {profile.subscriptionLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
