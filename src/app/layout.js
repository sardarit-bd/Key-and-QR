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

const themeScript = `
(function() {
  try {
    var key = 'myinspiretag-theme-mode';
    var stored = localStorage.getItem(key) || localStorage.getItem('theme');
    var path = window.location.pathname || '';
    var isDashboard = path.indexOf('/dashboard') !== -1;
    var isScan = path.startsWith('/t/') || path.startsWith('/tag/') || path.startsWith('/q/') || path.startsWith('/TAG-') || path.startsWith('/QR-');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    var mode = 'light';
    if (isScan) {
      mode = 'dark';
    } else if (isDashboard) {
      mode = stored ? stored : 'dark';
    } else if (stored === 'dark') {
      mode = 'dark';
    } else if (stored === 'light') {
      mode = 'light';
    } else {
      mode = prefersDark ? 'dark' : 'light';
    }

    var root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    root.style.colorScheme = mode;
    root.setAttribute('data-theme-mode', mode);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body
        className={`
          ${inter.variable}
          font-sans
          antialiased
          bg-background
          text-foreground
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