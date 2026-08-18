'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AssignQuotesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/new-dashboard/admin/quotes');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-foreground-secondary">Redirecting to All Quotes...</p>
      </div>
    </div>
  );
}
