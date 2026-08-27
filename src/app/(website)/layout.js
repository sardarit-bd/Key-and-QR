"use client";

import { usePathname } from "next/navigation";
import ConditionalFooter from "@/shared/ConditionalFooter";
import Header from "@/shared/Header";
import TopHeader from "@/shared/TopHeader";
import BottomTabBar from "@/components/dashboard/user/layout/BottomTabBar";

export default function WebsiteLayout({ children }) {
  const pathname = usePathname();
  const isScanPage =
    pathname?.startsWith('/t/') ||
    pathname?.startsWith('/tag/') ||
    pathname?.startsWith('/TAG-') ||
    pathname?.startsWith('/QR-');

  // Completely bypass website layout chrome on scan routes so it fills the raw viewport
  if (isScanPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopHeader />
      <Header />

      <main className="flex-1">
        {children}
      </main>

      <BottomTabBar />

      <ConditionalFooter />
    </div>
  );
}