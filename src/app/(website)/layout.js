import ConditionalFooter from "@/shared/ConditionalFooter";
import Header from "@/shared/Header";
import TopHeader from "@/shared/TopHeader";


export default function WebsiteLayout({ children }) {
  return (
    <>
      <TopHeader />
      <Header />

      <main className="min-h-screen">
        {children}
      </main>

      <ConditionalFooter />
    </>
  );
}