'use client';

export default function SidebarProfile({ user, isCollapsed }) {
  const getUserInitials = () => {
    if (!user?.name) return 'D';
    return user.name.charAt(0).toUpperCase();
  };

  if (isCollapsed) {
    return (
      <div className="flex justify-center px-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7c4d5b] to-[#403362] flex items-center justify-center text-white font-serif text-lg ring-1 ring-[#e3ba85]/40 shadow-[0_0_15px_rgba(227,186,133,0.15)]">
          {getUserInitials()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#0e111a] rounded-[24px] mb-8 mx-5 relative overflow-hidden">
      {/* Subtle Star Particles Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#e3ba85]/5 to-transparent opacity-50"></div>
      
      {/* Avatar */}
      <div className="relative flex-shrink-0 mb-4 z-10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#7c4d5b] via-[#5c4366] to-[#403362] flex items-center justify-center text-white font-serif text-[32px] ring-[1px] ring-[#e3ba85]/40 shadow-[0_0_20px_rgba(227,186,133,0.15)]">
          {getUserInitials()}
        </div>
      </div>

      {/* User Info */}
      <div className="flex flex-col items-center z-10">
        <h3 className="text-[17px] font-serif text-white tracking-wide mb-1">
          {user?.name || 'Dd'}
        </h3>
        <p className="text-[13px] text-gray-400 mb-4">
          {user?.email || 'teobitola@gmail.com'}
        </p>
        <div className="px-4 py-1.5 rounded-full bg-[#1e2337] border border-[#2d344d]">
          <span className="text-[12px] text-gray-300">
            {user?.isPremium ? 'Premium Plan' : 'Free Plan'}
          </span>
        </div>
      </div>
    </div>
  );
}