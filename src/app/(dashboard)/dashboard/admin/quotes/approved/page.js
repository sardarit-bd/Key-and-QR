'use client';

import AdminPendingQuotesPage from '@/components/dashboard/admin/quotes/AdminPendingQuotesPage';

export default function ApprovedQuotesRoute() {
  return <AdminPendingQuotesPage defaultStatus="approved" title="Approved Quotes" description="User-submitted quotes that have been approved and added to the collection." />;
}
