"use client";

import { usePathname } from "next/navigation";
import Footer from "../shared/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isTagPage = pathname?.startsWith('/t/');
  
  if (isDashboard || isTagPage) return null;
  
  return <Footer />;
}