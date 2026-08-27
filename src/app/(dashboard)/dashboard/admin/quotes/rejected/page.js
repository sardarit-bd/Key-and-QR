'use client';

import AdminPendingQuotesPage from '@/components/dashboard/admin/quotes/AdminPendingQuotesPage';

export default function RejectedQuotesRoute() {
  return <AdminPendingQuotesPage defaultStatus="rejected" title="Rejected Quotes" description="User-submitted quotes that were not approved." />;
}
