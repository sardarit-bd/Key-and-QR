'use client';

import AdminWelcomeHeader from './AdminWelcomeHeader';
import AdminStatsGrid from './AdminStatsGrid';
import AdminCharts from './AdminCharts';
import AdminActionRequired from './AdminActionRequired';
import AdminRecentOrders from './AdminRecentOrders';
import AdminRecentUsers from './AdminRecentUsers';
import AdminRecentActivity from './AdminRecentActivity';
import AdminQuickActions from './AdminQuickActions';
import AdminSystemStatus from './AdminSystemStatus';

export default function AdminDashboardHome({ data, selectedRange, onRangeChange }) {
  const {
    stats = {},
    charts = {},
    actionRequired = {},
    recentOrders = [],
    recentUsers = [],
    recentActivity = [],
    quickActions = [],
    systemStatus = null,
  } = data || {};

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-5 sm:space-y-6">
      {/* 1. Welcome Header + Date Range Selector + System Status */}
      <AdminWelcomeHeader selectedRange={selectedRange} onRangeChange={onRangeChange} />

      {/* 2. Primary KPI Cards */}
      <AdminStatsGrid stats={stats} actionRequired={actionRequired} />

      {/* 3. Action Required Bar / Alerts */}
      <AdminActionRequired actionRequired={actionRequired} />

      {/* 4. Advanced Interactive Business Charts */}
      <AdminCharts charts={charts} />

      {/* 5. Recent Orders + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        <AdminRecentOrders orders={recentOrders} />
        <AdminRecentUsers users={recentUsers} />
      </div>

      {/* 6. Recent Activity + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        <AdminRecentActivity activity={recentActivity} />
        <AdminSystemStatus systemStatus={systemStatus} />
      </div>

      {/* 7. Quick Actions */}
      <AdminQuickActions actions={quickActions} />
    </div>
  );
}
