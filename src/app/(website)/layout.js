import ConditionalFooter from "@/shared/ConditionalFooter";
import Header from "@/shared/Header";
import TopHeader from "@/shared/TopHeader";
import BottomTabBar from "@/components/dashboard/user/layout/BottomTabBar";

export default function WebsiteLayout({ children }) {
  return (
    <>
      <TopHeader />
      <Header />

      <main className="min-h-screen pb-20 lg:pb-0">
        {children}
      </main>

      <BottomTabBar />

      <ConditionalFooter />
    </>
  );
}