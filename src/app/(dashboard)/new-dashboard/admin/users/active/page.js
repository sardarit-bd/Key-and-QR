'use client';

import AdminUsersPage from '@/components/dashboard/admin/users/AdminUsersPage';

export default function ActiveUsersRoute() {
  return <AdminUsersPage title="Active Users" description="View all currently active users." defaultStatus="active" />;
}
