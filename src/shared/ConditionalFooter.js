"use client";

import { usePathname } from "next/navigation";
import Footer from "../shared/Footer";

const isDashboardPath = (pathname) => {
  if (!pathname) return false;

  return pathname.startsWith('/dashboard') || pathname.startsWith('/(dashboard)/new-dashboard');
};

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isDashboard = isDashboardPath(pathname);
  const isTagPage = pathname?.startsWith('/t/');

  if (isDashboard || isTagPage) return null;

  return <Footer />;
}