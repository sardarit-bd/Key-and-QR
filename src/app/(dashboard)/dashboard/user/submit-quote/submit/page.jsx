'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitQuoteSubmitRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/user/submit-quote');
  }, [router]);

  return null;
}
