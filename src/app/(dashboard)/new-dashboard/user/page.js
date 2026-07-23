'use client';

import { useDashboardOverview } from '@/hooks/dashboard/useDashboardOverview';
import DashboardHome from '@/components/dashboard/user/dashboard/DashboardHome';

/**
 * User Dashboard Page
 * Route: /new-dashboard/user
 * 
 * Restores original dashboard design exactly.
 * Only replaces hardcoded data with real backend data from GET /dashboard/overview.
 */
export default function UserDashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardOverview();

  // Loading state — show skeleton matching original layout
  if (isLoading) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 animate-pulse">
        {/* Row 1: Welcome & Banner skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 min-h-[180px] sm:min-h-[200px] lg:min-h-[220px]">
          <div className="bg-white/5 rounded-2xl h-full" />
          <div className="bg-white/5 rounded-2xl h-full" />
        </div>
        {/* Row 2: Categories skeleton */}
        <div className="bg-white/5 rounded-[22px] h-32" />
        {/* Row 3: Quotes & Streak skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <div className="xl:col-span-2 bg-white/5 rounded-2xl h-64" />
          <div className="xl:col-span-1 bg-white/5 rounded-[26px] h-64" />
        </div>
        {/* Row 4: Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl h-28" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-400 text-sm mb-4">
            {error?.message || "Failed to load dashboard"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-[#e3ba85] text-black font-medium rounded-xl hover:bg-[#d4a976] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Original dashboard layout with dynamic data
  return (
    <DashboardHome
      greeting={data?.greeting}
      banner={data?.banner}
      recentQuotes={data?.recentQuotes}
      streak={data?.streak}
      statistics={data?.statistics}
      categories={data?.categories}
      recentActivity={data?.recentActivity}
    />
  );
}
