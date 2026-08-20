'use client';

import { Crown, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarProfile({ profile, isCollapsed }) {
  const pathname = usePathname();
  const isAdmin =
    profile?.plan === 'admin' ||
    pathname?.startsWith('/new-dashboard/admin') ||
    pathname?.startsWith('/admin');
  const profileHref = isAdmin
    ? '/new-dashboard/admin/profile'
    : '/new-dashboard/user/profile';

  const hasAvatar = profile?.avatar;

  if (isCollapsed) {
    return (
      <div className="flex justify-center px-4 mb-6">
        <Link
          href={profileHref}
          className="relative w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-primary text-lg border border-sidebar-border overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer"
          title={`${profile?.name || 'Profile'} (${isAdmin ? 'Admin Profile' : 'User Profile'})`}
          aria-label="View Profile"
        >
          {hasAvatar ? (
            <img
              src={hasAvatar}
              alt={profile?.name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            profile?.initials
          )}
          {profile?.plan === 'premium' && (
            <div className="absolute -top-1 -right-1">
              <Crown className="w-3.5 h-3.5 text-accent" />
            </div>
          )}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-5 py-5 mb-4">
      {/* Avatar with Profile Link */}
      <Link
        href={profileHref}
        className="group relative flex-shrink-0 mb-3 block focus:outline-none"
        title="View profile settings"
      >
        <div className="relative w-16 h-16 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-primary text-[28px] border border-sidebar-border overflow-hidden group-hover:ring-2 group-hover:ring-primary/40 transition-all">
          {hasAvatar ? (
            <img
              src={hasAvatar}
              alt={profile?.name || 'User'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            profile?.initials
          )}
        </div>
        {profile?.plan === 'premium' && (
          <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-accent/40 bg-background">
            <Crown className="w-3 h-3 text-accent" />
          </div>
        )}
      </Link>

      {/* User Info */}
      <Link
        href={profileHref}
        className="text-[15px] font-semibold text-foreground mb-0.5 hover:text-primary transition-colors text-center truncate max-w-full"
      >
        {profile?.name}
      </Link>
      <p className="text-[12px] text-foreground-secondary mb-2 text-center truncate max-w-full">
        {profile?.email}
      </p>

      {profile?.memberSince && (
        <p className="text-[11px] text-foreground-tertiary mb-2">
          Member since {profile?.memberSince}
        </p>
      )}

      <span
        className={`px-3 py-1 rounded-full bg-background-secondary text-[11px] font-medium ${
          profile?.badgeColor || 'text-foreground-secondary'
        }`}
      >
        {profile?.subscriptionLabel}
      </span>
    </div>
  );
}
