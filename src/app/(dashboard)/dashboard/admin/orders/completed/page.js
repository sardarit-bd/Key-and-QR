'use client';

import AdminOrdersPage from '@/components/dashboard/admin/orders/AdminOrdersPage';

export default function CompletedOrdersRoute() {
  return <AdminOrdersPage defaultFulfillment="delivered" title="Completed Orders" description="Orders that have been delivered." />;
}
