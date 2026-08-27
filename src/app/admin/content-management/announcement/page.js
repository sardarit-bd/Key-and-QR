'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAnnouncementBannerPage from '@/components/dashboard/admin/content/AdminAnnouncementBannerPage';

export default function AdminContentManagementAnnouncementRoute() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/admin/content/announcement');
  }, [router]);

  return <AdminAnnouncementBannerPage />;
}
