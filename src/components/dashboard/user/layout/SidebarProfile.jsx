'use client';

import { Crown, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarProfile({ profile, isCollapsed, isCompact = false }) {
  const pathname = usePathname();
  const isAdmin =
    profile?.plan === 'admin' ||
    pathname?.startsWith('/dashboard/admin') ||
    pathname?.startsWith('/admin');

  const profileHref = isAdmin
    ? '/dashboard/admin/profile'
    : '/dashboard/user/profile';

  const hasAvatar = profile?.avatar;

  if (isCollapsed) {
    return (
      <div className="flex justify-center px-4 mb-4">
        <Link
          href={profileHref}
          className="relative w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-accent text-sm font-bold shadow-xs border border-accent/20 overflow-hidden hover:shadow-sm hover:border-accent/40 transition-all cursor-pointer"
          title={`${profile?.name || 'Profile'}`}
        >
          {hasAvatar ? (
            <img src={hasAvatar} alt="User" className="w-full h-full object-cover" />
          ) : (
            profile?.initials || 'U'
          )}
          {profile?.plan === 'premium' && (
            <div className="absolute -top-1 -right-1 bg-background rounded-full p-0.5 shadow-xs border border-border">
              <Crown className="w-3 h-3 text-amber-400" />
            </div>
          )}
        </Link>
      </div>
    );
  }

  // Compact horizontal layout for mobile or compact viewports
  if (isCompact) {
    return (
      <div className="mb-3">
        <div className="relative flex items-center gap-3 p-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border shadow-xs transition-all hover:border-accent/30">
          {/* Avatar on the Left */}
          <Link href={profileHref} className="group relative shrink-0">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden text-accent font-bold text-base shadow-2xs group-hover:scale-105 transition-all duration-300">
              {hasAvatar ? (
                <img src={hasAvatar} alt="User" className="w-full h-full object-cover" />
              ) : (
                profile?.initials || 'U'
              )}
            </div>
            {profile?.plan === 'premium' && (
              <div className="absolute -top-1 -right-1 bg-background rounded-full p-0.5 shadow-xs border border-border">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
              </div>
            )}
          </Link>

          {/* User Info on the Right */}
          <div className="min-w-0 flex-1">
            <Link
              href={profileHref}
              className="block text-sm font-semibold text-foreground truncate hover:text-accent transition-colors"
            >
              {profile?.name || 'User'}
            </Link>
            <p className="text-xs text-foreground-tertiary truncate">
              {profile?.email || ''}
            </p>
            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-semibold text-accent">
              <Shield className="w-3 h-3 shrink-0" />
              <span className="truncate">{profile?.subscriptionLabel || 'Free Plan'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mb-4">
      {/* Modern Card Effect */}
      <div className="relative flex flex-col items-center p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border shadow-xs transition-all hover:shadow-sm hover:border-accent/30">
        {/* Avatar Section */}
        <Link href={profileHref} className="group relative block mb-3">
          <div className="w-14 h-14 rounded-full p-1 bg-background shadow-xs border border-border group-hover:border-accent/40 group-hover:scale-105 transition-all duration-300">
            <div className="w-full h-full rounded-full bg-accent/10 flex items-center justify-center overflow-hidden text-accent font-bold text-lg">
              {hasAvatar ? (
                <img src={hasAvatar} alt="User" className="w-full h-full object-cover" />
              ) : (
                profile?.initials || 'U'
              )}
            </div>
          </div>
          {profile?.plan === 'premium' && (
            <div className="absolute bottom-0 right-0 p-0.5 bg-background rounded-full shadow-xs border border-border">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            </div>
          )}
        </Link>

        {/* User Info Section */}
        <div className="text-center w-full">
          <Link href={profileHref} className="block text-[15px] font-bold text-foreground mb-0.5 hover:text-accent transition-colors truncate">
            {profile?.name || 'User'}
          </Link>
          <p className="text-[12px] text-foreground-tertiary mb-2.5 truncate">
            {profile?.email || ''}
          </p>

          {/* Modern Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-semibold text-accent">
            <Shield className="w-3 h-3 shrink-0" />
            <span className="truncate">{profile?.subscriptionLabel || 'Free Plan'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}