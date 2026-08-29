"use client";

import { usePathname } from "next/navigation";
import ConditionalFooter from "@/shared/ConditionalFooter";
import Header from "@/shared/Header";
import TopHeader from "@/shared/TopHeader";
import BottomTabBar from "@/components/dashboard/user/layout/BottomTabBar";

export default function WebsiteLayout({ children }) {
  const pathname = usePathname();
  const isIsolatedPage =
    pathname?.startsWith('/t/') ||
    pathname?.startsWith('/tag/') ||
    pathname?.startsWith('/q/') ||
    pathname?.startsWith('/TAG-') ||
    pathname?.startsWith('/QR-');

  // Completely bypass website layout chrome on scan and public share routes
  if (isIsolatedPage) {
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