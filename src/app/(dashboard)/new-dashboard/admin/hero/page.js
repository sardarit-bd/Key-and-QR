'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedAdminHeroRoute() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/new-dashboard/admin/content/homepage-hero');
  }, [router]);

  return null;
}
