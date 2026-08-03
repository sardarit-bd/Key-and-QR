'use client';

import { useMemo } from 'react';
import { useDashboardOverview } from '@/hooks/dashboard/useDashboardOverview';
import { buildDashboardProps } from '@/utils/dashboard.utils';
import DashboardHome from '@/components/dashboard/user/dashboard/DashboardHome';

/**
 * User Dashboard Page
 * Route: /new-dashboard/user
 * 
 * Restores original dashboard design exactly.
 * Only replaces hardcoded data with real backend data from GET /dashboard/home
 * (quote receive engine). The UI is kept pixel-identical — this page only
 * maps backend data onto the exact props each section already renders.
 */
export default function UserDashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardOverview();

  // Normalize the /dashboard/home payload once per data change
  const props = useMemo(() => buildDashboardProps(data), [data]);

  // Loading state — show skeleton matching original layout
  if (isLoading) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 animate-pulse">
        {/* Row 1: Welcome & Banner skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 min-h-[180px] sm:min-h-[200px] lg:min-h-[220px]">
          <div className="bg-muted rounded-2xl h-full" />
          <div className="bg-muted rounded-2xl h-full" />
        </div>
        {/* Row 2: Categories skeleton */}
        <div className="bg-muted rounded-[22px] h-32" />
        {/* Row 3: Quotes & Streak skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <div className="xl:col-span-2 bg-muted rounded-2xl h-64" />
          <div className="xl:col-span-1 bg-muted rounded-[26px] h-64" />
        </div>
        {/* Row 4: Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-muted rounded-2xl h-28" />
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
          <p className="text-destructive text-sm mb-4">
            {error?.message || "Failed to load dashboard"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
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
      greeting={props.greeting}
      banner={props.banner}
      recentQuotes={props.recentQuotes}
      streak={props.streak}
      statistics={props.statistics}
      categories={props.categories}
      recentActivity={null}
      user={props.user}
      subscription={props.subscription}
    />
  );
}
