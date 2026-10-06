import AuthProvider from "@/components/auth/AuthProvider";

import "./globals.css";

import { Inter, Cormorant_Garamond, Playfair_Display } from "next/font/google";
import { Providers } from "@/providers/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
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
    var path = window.location.pathname || '';
    var isDashboard = path.indexOf('/dashboard') !== -1 || path.indexOf('/admin') !== -1;
    var root = document.documentElement;

    function cleanTheme(v) {
      if (!v || typeof v !== 'string') return null;
      var c = v.replace(/['"]+/g, '').trim().toLowerCase();
      return (c === 'light' || c === 'dark') ? c : null;
    }

    function getCookie(name) {
      try {
        var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
      } catch (e) {
        return null;
      }
    }

    var rawTheme = null;
    var rawLegacy = null;
    try {
      rawTheme = localStorage.getItem('theme');
      rawLegacy = localStorage.getItem('myinspiretag-theme-mode');
    } catch (e) {}

    var rawCookie = getCookie('theme');

    if (isDashboard) {
      // 1. Check primary 'theme' key, then legacy 'myinspiretag-theme-mode', then cookie
      var stored = cleanTheme(rawTheme) || cleanTheme(rawLegacy) || cleanTheme(rawCookie);

      // If a valid saved preference exists ('light' or 'dark'), use it directly!
      // Only default to 'dark' for dashboards if NO preference was ever stored.
      var mode = stored ? stored : 'dark';

      console.log('[ThemeScript:Head] path=' + path + ' | rawTheme=' + rawTheme + ' | rawLegacy=' + rawLegacy + ' | rawCookie=' + rawCookie + ' => applied mode=' + mode);

      root.classList.remove('light', 'dark');
      root.classList.add(mode);
      root.style.colorScheme = mode;
      root.setAttribute('data-theme-mode', mode);
    } else {
      console.log('[ThemeScript:Head] public/auth route (' + path + ') => applied light');
      // Public, auth, and landing pages strictly default to light mode
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
      root.setAttribute('data-theme-mode', 'light');
    }
  } catch (e) {
    console.warn('[ThemeScript:Head] error:', e);
  }
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
          ${cormorant.variable}
          ${playfair.variable}
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