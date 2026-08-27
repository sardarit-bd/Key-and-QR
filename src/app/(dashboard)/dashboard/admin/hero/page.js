'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedAdminHeroRoute() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/admin/content/homepage-hero');
  }, [router]);

  return null;
}
