import AuthProvider from "@/components/auth/AuthProvider";
import ConditionalFooter from "@/shared/ConditionalFooter";
import TopHeader from "@/shared/TopHeader";
import Header from "../shared/Header";
import "./globals.css";

import { Geist, Geist_Mono, Inter, Playfair_Display } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "QKey - Your Gateway to Digital Solutions",
  description:
    "Discover QKey, your ultimate destination for cutting-edge digital solutions. Explore our innovative products and services designed to elevate your business in the digital age.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${inter.variable}
          ${playfair.variable}
          font-sans
          antialiased
          bg-white
          text-black
        `}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
