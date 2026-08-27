'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/admin/profile');
  }, [router]);

  return null;
}
