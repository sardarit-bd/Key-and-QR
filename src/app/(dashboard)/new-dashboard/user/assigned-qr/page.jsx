'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AssignedQRRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/new-dashboard/user/my-qr');
  }, [router]);

  return null;
}
