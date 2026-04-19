"use client";

import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import {
    LayoutDashboard,
    LogOut,
    Mail,
    Menu,
    ShoppingBag,
    User,
    X,
    Home,
    Store,
    CreditCard,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { FaGoogle } from "react-icons/fa";

export default function Header() {
    const cart = useCartStore((state) => state.cart);
    const { user, logout, loading } = useAuthStore();
    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const isDashboard = pathname?.startsWith("/dashboard") || false;
    const drawerRef = useRef(null);

    // Helper function to get profile image URL
    const getProfileImageUrl = () => {
        if (!user?.profileImage) return null;
        if (typeof user.profileImage === 'string') return user.profileImage;
        if (user.profileImage?.url) return user.profileImage.url;
        return null;
    };

    // Body scroll lock when drawer open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open]);

    // Handle click outside to close drawer
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target) && open) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    // Handle escape key to close drawer
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && open) {
                setOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open]);

    // handle logout function
    const handleLogout = async () => {
        try {
            await logout();
            setOpen(false);
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // Handle menu open
    const handleMenuOpen = () => {
        setOpen(true);
    };

    // Handle menu close
    const handleMenuClose = () => {
        setOpen(false);
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.name) return "U";
        return user.name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Get provider icon
    const getProviderIcon = () => {
        if (user?.provider === "google") {
            return <FaGoogle size={12} className="text-blue-500" />;
        }
        return <Mail size={12} className="text-gray-500" />;
    };

    // Get provider text
    const getProviderText = () => {
        if (user?.provider === "google") {
            return "Google";
        }
        return "Email";
    };

    // Dashboard menu items
    const dashboardMenuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: user?.role === "admin" ? "/dashboard/admin" : "/dashboard/user" },
        { icon: ShoppingBag, label: "Cart", href: "/cart" },
    ];

    // Main site menu items (non-dashboard)
    const mainSiteMenuItems = [
        { icon: Home, label: "Home", href: "/" },
        { icon: Store, label: "Shop", href: "/shop" },
        { icon: CreditCard, label: "Subscription", href: "/subscription" },
    ];

    // Select menu items based on current route
    const mobileMenuItems = isDashboard ? dashboardMenuItems : mainSiteMenuItems;

    return (
        <>
            {/* HEADER - Desktop unchanged */}
            <header className={`py-3 bg-white sticky top-0 z-50 ${!isDashboard && 'md:shadow-sm'}`}>
                <div className={`${isDashboard ? "px-6 flex items-center justify-between" : "max-w-7xl px-4 mx-auto flex items-center justify-between"}`}>

                    {/* Logo - Hidden on mobile, visible on desktop */}
                    <Link href="/" className={`${isDashboard ? "flex items-center space-x-2 ml-0 md:ml-12 lg:ml-0" : "flex items-center space-x-2"} hidden md:block`}>
                        <Image src="/logo.png" alt="Logo" width={100} height={50} />
                    </Link>

                    {/* Desktop Navigation - Only show on non-dashboard routes */}
                    {!isDashboard && (
                        <nav className="hidden md:block">
                            <ul className="flex space-x-12 text-gray-700 font-medium">
                                <li><Link href="/" className="hover:text-brandColor">Home</Link></li>
                                <li><Link href="/shop" className="hover:text-brandColor">Shop</Link></li>
                                <li><Link href="/subscription" className="hover:text-brandColor">Subscription</Link></li>
                            </ul>
                        </nav>
                    )}

                    {/* Desktop Right Side */}
                    <div className="hidden md:flex items-center space-x-4">

                        {/* Cart - Show on non-dashboard only */}
                        {!isDashboard && (
                            <Link href="/cart" className="relative mt-0.5">
                                <ShoppingBag className="text-gray-700" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {user ? (
                            <div className="relative group">
                                <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer bg-black flex items-center justify-center">
                                    {(() => {
                                        const imageUrl = getProfileImageUrl();
                                        if (imageUrl) {
                                            return (
                                                <img
                                                    src={imageUrl}
                                                    alt={user?.name || "User"}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const parent = e.target.parentElement;
                                                        if (parent) {
                                                            parent.innerHTML = `<span className="text-white text-sm font-semibold">${getUserInitials()}</span>`;
                                                        }
                                                    }}
                                                />
                                            );
                                        }
                                        return (
                                            <span className="text-white text-sm font-semibold">
                                                {getUserInitials()}
                                            </span>
                                        );
                                    })()}
                                </div>

                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-72 bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-black flex items-center justify-center">
                                                {(() => {
                                                    const imageUrl = getProfileImageUrl();
                                                    if (imageUrl) {
                                                        return (
                                                            <img
                                                                src={imageUrl}
                                                                alt={user?.name || "User"}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    const parent = e.target.parentElement;
                                                                    if (parent) {
                                                                        parent.innerHTML = `<span className="text-white text-base font-semibold">${getUserInitials()}</span>`;
                                                                    }
                                                                }}
                                                            />
                                                        );
                                                    }
                                                    return (
                                                        <span className="text-white text-base font-semibold">
                                                            {getUserInitials()}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-gray-800 capitalize">
                                                        {user?.name || "User"}
                                                    </p>
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                        {user?.role === "admin" ? "Admin" : "User"}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {getProviderIcon()}
                                                    <span className="text-xs text-gray-400">
                                                        Signed in with {getProviderText()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="py-2">
                                        <Link
                                            href={`${user?.role === "admin" ? "/dashboard/admin" : "/dashboard/user"}`}
                                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                                <LayoutDashboard size={18} className="text-gray-600" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium">Dashboard</span>
                                                <p className="text-xs text-gray-400">View your activity</p>
                                            </div>
                                        </Link>

                                        <div className="my-1 border-t border-gray-100 mx-4"></div>

                                        <button
                                            onClick={handleLogout}
                                            disabled={loading}
                                            className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-700 hover:bg-gray-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                                <LogOut size={18} className="text-gray-600" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium">
                                                    {loading ? "Logging out..." : "Logout"}
                                                </span>
                                                <p className="text-xs text-gray-400">Sign out of your account</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            !isDashboard && (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-gray-700 px-4 py-2 border rounded-md hover:bg-gray-700 hover:text-white transition"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )
                        )}
                    </div>
                </div>
            </header>

            {/* 🔥 BOTTOM FLOATING ACTION BUTTON - Mobile & Tablet Only (Only for non-dashboard) */}
            {!isDashboard && (
                <div className="md:hidden fixed bottom-6 right-6 z-50">
                    <button
                        onClick={handleMenuOpen}
                        className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white rounded-full shadow-2xl hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden"
                        aria-label="Open menu"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                        <Menu size={26} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                        <Sparkles size={14} className="absolute -top-1 -right-1 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                </div>
            )}

            {/* BACKDROP WITH BLUR */}
            {open && (
                <div
                    onClick={handleMenuClose}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
                />
            )}

            {/* RIGHT DRAWER FOR MOBILE & TABLET */}
            <div
                ref={drawerRef}
                className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-white z-[999] shadow-2xl
                transform transition-transform duration-300 ease-out
                ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Logo" width={80} height={40} priority />
                    </div>
                    <button 
                        onClick={handleMenuClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        aria-label="Close menu"
                    >
                        <X size={22} className="text-gray-600" />
                    </button>
                </div>

                {/* User Info Section (if logged in) */}
                {user && (
                    <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-gray-700 to-black flex items-center justify-center shadow-md">
                                {(() => {
                                    const imageUrl = getProfileImageUrl();
                                    if (imageUrl) {
                                        return (
                                            <img
                                                src={imageUrl}
                                                alt={user?.name || "User"}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const parent = e.target.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = `<span className="text-white text-lg font-bold">${getUserInitials()}</span>`;
                                                    }
                                                }}
                                            />
                                        );
                                    }
                                    return (
                                        <span className="text-white text-lg font-bold">
                                            {getUserInitials()}
                                        </span>
                                    );
                                })()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-gray-800 capitalize">
                                        {user?.name || "User"}
                                    </p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        user?.role === "admin" 
                                            ? "bg-purple-100 text-purple-700" 
                                            : "bg-green-100 text-green-700"
                                    }`}>
                                        {user?.role === "admin" ? "Admin" : "User"}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 break-all">{user?.email}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    {getProviderIcon()}
                                    <span className="text-xs text-gray-400">
                                        {getProviderText()} account
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 p-5 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {/* Menu Items - Dynamic based on route */}
                    {mobileMenuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={handleMenuClose}
                                className={`flex items-center justify-between py-3 px-3 rounded-xl transition-all duration-200 ${
                                    isActive 
                                        ? "bg-gray-900 text-white" 
                                        : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={20} className={isActive ? "text-white" : "text-gray-500"} />
                                    <span className="font-medium">{item.label}</span>
                                </div>
                                {isActive && <ChevronRight size={18} className="text-white" />}
                            </Link>
                        );
                    })}

                    {/* Divider */}
                    <div className="my-4 border-t border-gray-100"></div>

                    {/* Cart Link - Only for non-dashboard */}
                    {!isDashboard && (
                        <Link
                            href="/cart"
                            onClick={handleMenuClose}
                            className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-100 transition-all duration-200 text-gray-700"
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={20} className="text-gray-500" />
                                <span className="font-medium">Cart</span>
                            </div>
                            {cartCount > 0 && (
                                <span className="bg-gray-900 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* Auth Section */}
                    {user ? (
                        <>
                            <div className="my-2 border-t border-gray-100"></div>
                            
                            {!isDashboard && (
                                <Link
                                    href={`${user?.role === "admin" ? "/dashboard/admin" : "/dashboard/user"}`}
                                    onClick={handleMenuClose}
                                    className="flex items-center gap-3 py-3 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 text-gray-700 mt-2"
                                >
                                    <LayoutDashboard size={20} className="text-gray-600" />
                                    <span className="font-medium">Dashboard</span>
                                </Link>
                            )}

                            <button
                                onClick={handleLogout}
                                disabled={loading}
                                className="flex items-center gap-3 py-3 px-3 rounded-xl w-full text-red-600 hover:bg-red-50 transition-all duration-200 mt-2 cursor-pointer disabled:opacity-50"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">{loading ? "Logging out..." : "Logout"}</span>
                            </button>
                        </>
                    ) : (
                        !isDashboard && (
                            <div className="mt-4 space-y-3">
                                <Link
                                    href="/login"
                                    onClick={handleMenuClose}
                                    className="block w-full py-3 px-4 bg-gray-900 text-white rounded-xl text-center font-medium hover:bg-gray-800 transition-all duration-200"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={handleMenuClose}
                                    className="block w-full py-3 px-4 border-2 border-gray-900 text-gray-900 rounded-xl text-center font-medium hover:bg-gray-900 hover:text-white transition-all duration-200"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )
                    )}
                </nav>
            </div>
        </>
    );
}