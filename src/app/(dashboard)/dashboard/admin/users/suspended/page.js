'use client';

import AdminUsersPage from '@/components/dashboard/admin/users/AdminUsersPage';

export default function SuspendedUsersRoute() {
  return <AdminUsersPage title="Suspended Users" description="View all suspended users." defaultStatus="suspended" />;
}
