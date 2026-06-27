'use client';

import Sidebar from "@/components/dashboard/user/layout/Sidebar";
import { ThemeProvider } from "@/config/dashboard/engine/ThemeProvider";
import { THEME_IDS } from "@/config/dashboard/themes";
import { useAuthStore } from "@/store/authStore";

export default function UserDashboardLayout({ children }) {
  const { user } = useAuthStore();

  return (
    <ThemeProvider themeId={THEME_IDS.USER_DASHBOARD}>
      {/* bg-[#070911] হলো রেফারেন্স ইমেজের এক্স্যাক্ট ব্যাকগ্রাউন্ড কালার।
        flex ব্যবহার করা হয়েছে লেআউট ঠিক রাখার জন্য।
      */}
      <div className="min-h-screen flex bg-[#070911] text-white font-sans selection:bg-[#e3ba85]/30">
        
        {/* Sidebar Component */}
        <Sidebar user={user} />
        
        {/* Main Content Area:
          lg:ml-72 (২৮৮px) দেওয়া হয়েছে কারণ সাধারণত ডেস্কটপে সাইডবারের width 72 থাকে। 
          আপনার সাইডবারের width যদি ভিন্ন হয়, তাহলে ml-72 পরিবর্তন করে সেই অনুযায়ী দিবেন (যেমন: lg:ml-[320px])।
        */}
        <main className="flex-1 w-full transition-all duration-300">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
        
      </div>
    </ThemeProvider>
  );
}