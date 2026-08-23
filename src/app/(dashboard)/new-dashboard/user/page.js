'use client';

import { Suspense, useMemo } from 'react';
import { useDashboardOverview } from '@/hooks/dashboard/useDashboardOverview';
import { buildDashboardProps } from '@/utils/dashboard.utils';
import DashboardHome from '@/components/dashboard/user/dashboard/DashboardHome';

export default function UserDashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardOverview();

  const props = useMemo(() => buildDashboardProps(data), [data]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10 space-y-8 sm:space-y-10 md:space-y-12 animate-pulse">
        {/* Greeting skeleton */}
        <div className="space-y-2">
          <div className="h-10 bg-muted rounded w-64 sm:w-80" />
          <div className="h-5 bg-muted rounded w-56" />
        </div>

        {/* Quote skeleton */}
        <div className="bg-muted rounded-[24px] sm:rounded-[28px] h-[360px] sm:h-[420px] md:h-[460px]" />

        {/* Categories skeleton — cards now */}
        <div className="space-y-3">
          <div className="h-6 bg-muted rounded w-40" />
          <div className="flex gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[100px] sm:h-[110px] bg-muted rounded-2xl w-[96px] sm:w-[104px] flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Library skeleton */}
        <div className="space-y-3">
          <div className="h-6 bg-muted rounded w-32" />
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
            <div className="h-20 sm:h-24 bg-muted rounded-2xl" />
            <div className="h-20 sm:h-24 bg-muted rounded-2xl" />
          </div>
        </div>

        {/* Streak skeleton — full width */}
        <div className="h-[240px] sm:h-[260px] bg-muted rounded-2xl" />

        {/* Stats skeleton */}
        <div className="h-[80px] bg-muted rounded-2xl" />
      </div>
    );
  }

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

  return (
    <Suspense fallback={null}>
      <DashboardHome
        greeting={props.greeting}
        latestInspiration={props.latestInspiration}
        streak={props.streak}
        statistics={props.statistics}
        categories={props.categories}
        user={props.user}
        subscription={props.subscription}
        dailyUsage={props.dailyUsage}
      />
    </Suspense>
  );
}
