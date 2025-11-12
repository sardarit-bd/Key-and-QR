import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "../shared/Header";
import Footer from "../shared/Footer";

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

export const metadata = {
  title: "QKey - Your Gateway to Digital Solutions",
  description: "Discover QKey, your ultimate destination for cutting-edge digital solutions. Explore our innovative products and services designed to elevate your business in the digital age.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} font-sans antialiased bg-white text-black`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
