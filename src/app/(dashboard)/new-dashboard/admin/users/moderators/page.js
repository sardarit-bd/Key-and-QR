'use client';

import AdminUsersPage from '@/components/dashboard/admin/users/AdminUsersPage';

export default function ModeratorsRoute() {
  return <AdminUsersPage title="Moderators" description="View all moderator users." defaultRole="moderator" />;
}
