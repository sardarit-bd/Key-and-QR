import AuthProvider from "@/components/auth/AuthProvider";

import "./globals.css";

import { Inter } from "next/font/google";
import { Providers } from "@/providers/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" className="light">
      <body
        className={`
          ${inter.variable}
          font-sans
          antialiased
          bg-white
          text-black
        `}
        suppressHydrationWarning
      >
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}