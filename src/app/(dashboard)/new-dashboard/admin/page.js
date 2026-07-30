'use client';

import { useAdminDashboardOverview } from '@/hooks/dashboard/useAdminDashboardOverview';
import AdminDashboardHome from '@/components/dashboard/admin/overview/AdminDashboardHome';

/**
 * Admin Dashboard Overview Page
 * Route: /new-dashboard/admin
 *
 * Displays the admin overview with key platform metrics.
 * Uses mock data by default — set useMock=false when backend endpoint is ready.
 */
export default function AdminDashboardPage() {
  const { data, isLoading, error, refetch } = useAdminDashboardOverview();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 animate-pulse">
        {/* Welcome skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-10 bg-muted rounded-xl w-64" />
          <div className="h-5 bg-muted rounded w-40" />
        </div>
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-[22px] border border-border h-24" />
          ))}
        </div>
        {/* Two-column skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <div className="bg-card rounded-[22px] border border-border h-64" />
          <div className="bg-card rounded-[22px] border border-border h-64" />
        </div>
        {/* Activity + System Status skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <div className="bg-card rounded-[22px] border border-border h-80" />
          <div className="bg-card rounded-[22px] border border-border h-80" />
        </div>
        {/* Quick actions skeleton */}
        <div className="bg-card rounded-[22px] border border-border h-36" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <span className="text-2xl">!</span>
          </div>
          <p className="text-destructive text-sm mb-2 font-medium">
            Failed to load dashboard
          </p>
          <p className="text-foreground-tertiary text-xs mb-6">
            {error?.message || 'An unexpected error occurred. Please try again.'}
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

  // Empty state (unlikely but handled)
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-foreground-tertiary text-sm mb-4">
            No dashboard data available.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboardHome data={data} />;
}
