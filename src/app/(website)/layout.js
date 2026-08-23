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

  return (
    <div className={`flex flex-col ${isScanPage ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      <TopHeader />
      <Header />

      <main className={`flex-1 ${isScanPage ? 'h-full overflow-hidden' : 'pb-16 lg:pb-0'}`}>
        {children}
      </main>

      <BottomTabBar />

      <ConditionalFooter />
    </div>
  );
}