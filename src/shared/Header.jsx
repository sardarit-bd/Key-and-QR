"use client";

import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  ShoppingBag,
  User,
  Home,
  Store,
  Heart,
  LogIn,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";

// shadcn/ui imports
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Header() {
  const cart = useCartStore((state) => state.cart);
  const { user, logout, loading } = useAuthStore();
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname?.startsWith("/dashboard") || false;

  const isScanPage =
    pathname?.startsWith("/TAG-") ||
    pathname?.startsWith("/QR-") ||
    pathname?.startsWith("/t/");

  if (isScanPage) return null;

  // Navigation items
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Inspiration", href: "/inspiration" },
  ];

  // Sheet menu items
  const sheetNavItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Store, label: "Shop", href: "/shop" },
    { icon: Sparkles, label: "How It Works", href: "/how-it-works" },
    { icon: Heart, label: "Inspiration", href: "/inspiration" },
  ];

  const sheetSecondaryItems = [
    {
      icon: User,
      label: "My Account",
      href: user
        ? user?.role === "admin"
          ? "/dashboard/admin"
          : "/dashboard/user"
        : "/login",
    },
    { icon: Heart, label: "Wishlist", href: "/wishlist" },
    { icon: ShoppingBag, label: "Cart", href: "/cart", badge: cartCount },
  ];

  // Helper functions
  const getProfileImageUrl = () => {
    if (!user?.profileImage) return null;
    if (typeof user.profileImage === "string") return user.profileImage;
    if (user.profileImage?.url) return user.profileImage.url;
    return null;
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getProviderIcon = () => {
    if (user?.provider === "google") {
      return <FaGoogle size={12} className="text-blue-500" />;
    }
    return <Mail size={12} className="text-gray-500" />;
  };

  const getProviderText = () => {
    if (user?.provider === "google") return "Google";
    return "Email";
  };

  const handleLogout = async () => {
    try {
      await logout();
      setSheetOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const activeIndex = navItems.findIndex((item) => pathname === item.href);

  return (
    <>
      {/* DESKTOP HEADER */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100 hidden md:block">
        <div
          className={`${
            isDashboard ? "px-6" : "max-w-7xl mx-auto px-6 lg:px-8"
          } h-[96px] flex items-center justify-between`}
        >
          {/* Logo - Left aligned */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="relative w-[150px] h-[60px]">
              <Image
                src="/logo/logo.png"
                alt="Brand Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation - Centered with Framer Motion */}
          {!isDashboard && (
            <nav className="absolute left-1/2 transform -translate-x-1/2">
              <ul className="flex items-center gap-10 lg:gap-14 relative">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name} className="relative">
                      <Link
                        href={item.href}
                        className={`relative block py-2 text-[15px] lg:text-base font-medium tracking-wide transition-colors duration-300 ${
                          isActive
                            ? "text-gray-900"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        {item.name}
                        {isActive && (
                          <motion.div
                            layoutId="activeNavUnderline"
                            className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gray-900 rounded-full"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            }}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          {/* Desktop Right Actions */}
          <div className="flex items-center gap-6">
            {/* User Dropdown - shadcn/ui */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer focus:outline-none">
                    <Avatar className="w-9 h-9 ring-1 ring-gray-200 hover:ring-gray-300 transition-all">
                      <AvatarImage
                        src={getProfileImageUrl() || ""}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback className="bg-gray-100 text-gray-700 text-sm font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 mt-2">
                  <DropdownMenuLabel className="p-0">
                    <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-white rounded-t-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src={getProfileImageUrl() || ""}
                            alt={user?.name || "User"}
                          />
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-base font-semibold">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-800 capitalize">
                              {user?.name || "User"}
                            </p>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {user?.role === "admin" ? "Admin" : "Member"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {user?.email}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {getProviderIcon()}
                            <span className="text-xs text-gray-400">
                              {getProviderText()} account
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      href={`${
                        user?.role === "admin"
                          ? "/dashboard/admin"
                          : "/dashboard/user"
                      }`}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <LayoutDashboard size={18} className="text-gray-400" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={loading}
                    className="cursor-pointer flex items-center gap-3 px-4 py-3 text-red-600 focus:text-red-600"
                  >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">
                      {loading ? "Logging out..." : "Logout"}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors duration-300"
                aria-label="Account"
              >
                <User size={25} strokeWidth={1.5} />
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative mt-0.5 text-gray-600 hover:text-gray-900 transition-colors duration-300"
            >
              <ShoppingBag size={25} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILE HEADER */}
      {!isDashboard && (
        <header className="md:hidden bg-white sticky top-0 z-50 border-b border-gray-100">
          <div className="h-[72px] px-4 flex items-center justify-between">
            {/* Left: Sheet Trigger */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 -ml-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
                  aria-label="Open menu"
                >
                  <Menu size={24} strokeWidth={1.5} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] p-0">
                <SheetHeader className="p-6 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
                  <SheetTitle className="hidden">Menu</SheetTitle>
                  <Image
                    src="/logo/drawer-header-logo.png"
                    alt="Logo"
                    width={100}
                    height={50}
                  />
                </SheetHeader>

                {/* Navigation Section */}
                <div className="flex-1 overflow-y-auto py-8">
                  <div className="px-6 space-y-6">
                    {sheetNavItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setSheetOpen(false)}
                          className="flex items-center gap-4 group"
                        >
                          <item.icon
                            size={22}
                            strokeWidth={1.5}
                            className={`transition-colors duration-200 ${
                              isActive
                                ? "text-gray-900"
                                : "text-gray-400 group-hover:text-gray-600"
                            }`}
                          />
                          <span
                            className={`text-[17px] font-medium tracking-wide transition-colors duration-200 ${
                              isActive
                                ? "text-gray-900"
                                : "text-gray-700 group-hover:text-gray-900"
                            }`}
                          >
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  <Separator className="my-8" />

                  {/* Secondary Section */}
                  <div className="px-6 space-y-6">
                    {sheetSecondaryItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setSheetOpen(false)}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <item.icon
                              size={22}
                              strokeWidth={1.5}
                              className={`transition-colors duration-200 ${
                                isActive
                                  ? "text-gray-900"
                                  : "text-gray-400 group-hover:text-gray-600"
                              }`}
                            />
                            <span
                              className={`text-[17px] font-medium tracking-wide transition-colors duration-200 ${
                                isActive
                                  ? "text-gray-900"
                                  : "text-gray-700 group-hover:text-gray-900"
                              }`}
                            >
                              {item.label}
                            </span>
                          </div>
                          {item.badge > 0 && (
                            <span className="bg-gray-900 text-white text-xs font-medium min-w-[22px] h-[22px] rounded-full flex items-center justify-center px-1.5">
                              {item.badge > 99 ? "99+" : item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}

                    {/* Auth Section */}
                    {!user && (
                      <div className="pt-4 space-y-3">
                        <Button
                          asChild
                          className="w-full bg-gray-900 hover:bg-gray-800 rounded-full"
                        >
                          <Link
                            href="/login"
                            onClick={() => setSheetOpen(false)}
                            className="flex items-center justify-center gap-2"
                          >
                            <LogIn size={16} />
                            Sign In
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full rounded-full border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900"
                        >
                          <Link
                            href="/signup"
                            onClick={() => setSheetOpen(false)}
                            className="flex items-center justify-center gap-2"
                          >
                            Get Started
                          </Link>
                        </Button>
                      </div>
                    )}

                    {user && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={getProfileImageUrl() || ""}
                              alt={user?.name || "User"}
                            />
                            <AvatarFallback className="bg-gray-200 text-gray-700 text-sm font-semibold">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 capitalize">
                              {user?.name || "User"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={handleLogout}
                          disabled={loading}
                          variant="outline"
                          className="w-full rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
                        >
                          <LogOut size={16} className="mr-2" />
                          {loading ? "Logging out..." : "Logout"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Center: Brand Logo */}
            <Link href="/" className="flex items-center justify-center">
              <Image
                src="/logo/logo.png"
                alt="Brand Logo"
                width={120}
                height={45}
                priority
                className="object-contain"
              />
            </Link>

            {/* Right: Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 -mr-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[10px] font-medium min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </header>
      )}
    </>
  );
}