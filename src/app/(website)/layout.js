import ConditionalFooter from "@/shared/ConditionalFooter";
import Header from "@/shared/Header";
import TopHeader from "@/shared/TopHeader";
import BottomTabBar from "@/components/dashboard/user/layout/BottomTabBar";

export default function WebsiteLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopHeader />
      <Header />

      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>

      <BottomTabBar />

      <ConditionalFooter />
    </div>
  );
}