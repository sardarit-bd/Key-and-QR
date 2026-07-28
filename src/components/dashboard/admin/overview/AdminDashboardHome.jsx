'use client';

import AdminWelcomeHeader from './AdminWelcomeHeader';
import AdminStatsGrid from './AdminStatsGrid';
import AdminRecentOrders from './AdminRecentOrders';
import AdminRecentUsers from './AdminRecentUsers';
import AdminRecentActivity from './AdminRecentActivity';
import AdminQuickActions from './AdminQuickActions';
import AdminSystemStatus from './AdminSystemStatus';

export default function AdminDashboardHome({ data }) {
  const {
    stats = {},
    recentOrders = [],
    recentUsers = [],
    recentActivity = [],
    quickActions = [],
    systemStatus = null,
  } = data || {};

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Row 1: Welcome Header */}
      <AdminWelcomeHeader />

      {/* Row 2: Quick Statistics */}
      <AdminStatsGrid stats={stats} />

      {/* Row 3: Recent Orders + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        <AdminRecentOrders orders={recentOrders} />
        <AdminRecentUsers users={recentUsers} />
      </div>

      {/* Row 4: Recent Activity + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        <AdminRecentActivity activity={recentActivity} />
        <AdminSystemStatus systemStatus={systemStatus} />
      </div>

      {/* Row 5: Quick Actions */}
      <AdminQuickActions actions={quickActions} />
    </div>
  );
}
