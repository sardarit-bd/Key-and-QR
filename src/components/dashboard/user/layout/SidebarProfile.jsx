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
          className="relative w-11 h-11 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-bold shadow-sm border border-indigo-100/50 dark:border-indigo-500/20 overflow-hidden hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-400/50 transition-all cursor-pointer"
          title={`${profile?.name || 'Profile'}`}
        >
          {hasAvatar ? (
            <img src={hasAvatar} alt="User" className="w-full h-full object-cover" />
          ) : (
            profile?.initials || 'SA'
          )}
          {profile?.plan === 'premium' && (
            <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm border border-transparent dark:border-gray-800">
              <Crown className="w-3 h-3 text-amber-500 dark:text-amber-400" />
            </div>
          )}
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 mb-6">
      {/* Modern Floating Card Effect with Dark Mode Support */}
      <div className="relative flex flex-col items-center p-5 rounded-2xl bg-white/50 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200/60 dark:border-gray-800/60 shadow-sm transition-all hover:shadow-md hover:border-indigo-200/60 dark:hover:border-indigo-500/30">

        {/* Avatar Section */}
        <Link href={profileHref} className="group relative block mb-4">
          <div className="w-16 h-16 rounded-full p-1 bg-white dark:bg-gray-950 shadow-sm border border-gray-100 dark:border-gray-800 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/50 group-hover:scale-105 transition-all duration-300">
            <div className="w-full h-full rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center overflow-hidden text-indigo-600 dark:text-indigo-400 font-bold text-xl">
              {hasAvatar ? (
                <img src={hasAvatar} alt="User" className="w-full h-full object-cover" />
              ) : (
                profile?.initials || 'SA'
              )}
            </div>
          </div>
          {profile?.plan === 'premium' && (
            <div className="absolute bottom-0 right-0 p-1 bg-white dark:bg-gray-900 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
              <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
          )}
        </Link>

        {/* User Info Section */}
        <div className="text-center w-full">
          <Link href={profileHref} className="block text-[16px] font-bold text-gray-800 dark:text-gray-100 mb-0.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate">
            {profile?.name || 'Super Admin'}
          </Link>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-3 truncate">
            {profile?.email || 'zzmante@gmail.com'}
          </p>

          {/* Modern Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100/80 dark:border-indigo-500/20 text-[12px] font-semibold text-indigo-600 dark:text-indigo-400">
            <Shield className="w-3.5 h-3.5" />
            {profile?.subscriptionLabel || 'Administrator'}
          </div>
        </div>
      </div>
    </div>
  );
}