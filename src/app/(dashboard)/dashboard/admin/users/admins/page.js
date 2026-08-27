'use client';

import AdminUsersPage from '@/components/dashboard/admin/users/AdminUsersPage';

export default function AdminsRoute() {
  return <AdminUsersPage title="Administrators" description="View all admin users." defaultRole="admin" />;
}
