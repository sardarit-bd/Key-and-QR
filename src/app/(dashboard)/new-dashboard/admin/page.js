'use client';

import { useState } from 'react';
import { useAdminDashboardOverview } from '@/hooks/dashboard/useAdminDashboardOverview';
import AdminDashboardHome from '@/components/dashboard/admin/overview/AdminDashboardHome';

/**
 * Admin Dashboard Overview Page
 * Route: /new-dashboard/admin
 *
 * Displays real-time business intelligence, interactive charts, and operational KPIs.
 */
export default function AdminDashboardPage() {
  const [selectedRange, setSelectedRange] = useState('30d');
  const { data, isLoading, error, refetch } = useAdminDashboardOverview({ range: selectedRange });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 animate-pulse">
        {/* Welcome skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-9 bg-muted rounded-xl w-64" />
            <div className="h-4 bg-muted rounded w-48" />
          </div>
          <div className="h-10 bg-muted rounded-xl w-40" />
        </div>
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border h-28" />
          ))}
        </div>
        {/* Large chart skeleton */}
        <div className="bg-card rounded-2xl border border-border h-[400px]" />
        {/* Medium charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <div className="bg-card rounded-2xl border border-border h-72" />
          <div className="bg-card rounded-2xl border border-border h-72" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto p-6 rounded-3xl bg-card border border-border shadow-xl">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <span className="text-2xl text-destructive font-bold">!</span>
          </div>
          <h2 className="text-base font-bold text-foreground mb-1">Failed to load analytics</h2>
          <p className="text-xs text-foreground-secondary mb-6">
            {error?.message || 'An error occurred while aggregating dashboard data.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-xs cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboardHome
      data={data}
      selectedRange={selectedRange}
      onRangeChange={setSelectedRange}
    />
  );
}
