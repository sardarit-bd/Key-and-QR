"use client";

import { usePathname } from "next/navigation";
import Footer from "../shared/Footer";

const isDashboardPath = (pathname) => {
  if (!pathname) return false;

  return pathname.startsWith('/dashboard') || pathname.startsWith('/(dashboard)/dashboard');
};

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isDashboard = isDashboardPath(pathname);
  const isExcludedPage =
    pathname?.startsWith('/t/') ||
    pathname?.startsWith('/tag/') ||
    pathname?.startsWith('/q/') ||
    pathname?.startsWith('/TAG-') ||
    pathname?.startsWith('/QR-');

  if (isDashboard || isExcludedPage) return null;

  return <Footer />;
}