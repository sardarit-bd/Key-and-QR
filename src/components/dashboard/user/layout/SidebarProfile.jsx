'use client';

import { Crown } from 'lucide-react';

export default function SidebarProfile({ profile, isCollapsed }) {
  const hasAvatar = profile?.avatar;

  if (isCollapsed) {
    return (
      <div className="flex justify-center px-4 mb-6">
        <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#7c4d5b] to-[#403362] flex items-center justify-center text-white font-serif text-lg ring-1 ring-[#e3ba85]/40 shadow-[0_0_15px_rgba(227,186,133,0.15)] overflow-hidden">
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
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#0e111a] rounded-[24px] mb-8 mx-5 relative overflow-hidden">
      {/* Subtle Star Particles Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#e3ba85]/5 to-transparent opacity-50" />
      
      {/* Avatar */}
      <div className="relative flex-shrink-0 mb-4 z-10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#7c4d5b] via-[#5c4366] to-[#403362] flex items-center justify-center text-white font-serif text-[32px] ring-[1px] ring-[#e3ba85]/40 shadow-[0_0_20px_rgba(227,186,133,0.15)] overflow-hidden">
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
          <div className="absolute -top-1 -right-1">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex flex-col items-center z-10">
        <h3 className="text-[17px] font-serif text-white tracking-wide mb-1">
          {profile.name}
        </h3>
        <p className="text-[13px] text-gray-400 mb-2">
          {profile.email}
        </p>
        
        {/* Member Since */}
        {profile.memberSince && (
          <p className="text-[11px] text-gray-500 mb-2">
            Member since {profile.memberSince}
          </p>
        )}

        {/* Subscription Badge */}
        <div className={`px-4 py-1.5 rounded-full ${profile.bgColor} border ${profile.borderColor}`}>
          <span className={`text-[12px] ${profile.badgeColor}`}>
            {profile.subscriptionLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
