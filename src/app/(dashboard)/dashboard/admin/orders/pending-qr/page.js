'use client';

import AdminOrdersPage from '@/components/dashboard/admin/orders/AdminOrdersPage';

export default function PendingQRRoute() {
  return <AdminOrdersPage defaultTagAssignment="pending_assignment" title="Pending QR Assignment" description="Paid orders waiting for QR tag assignment." />;
}
