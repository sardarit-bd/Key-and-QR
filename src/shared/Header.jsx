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
    X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";


export default function Header() {
    const cart = useCartStore((state) => state.cart);
    const { user, logout, loading } = useAuthStore();
    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const isDashboard = pathname.startsWith("/dashboard");

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

    // handle logout function
    const handleLogout = async () => {
        await logout();
        setOpen(false);
        router.push("/");
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

    // Get profile image or fallback component
    const ProfileAvatar = ({ size = "md", showFallback = true }) => {
        const imageUrl = getProfileImageUrl();
        const sizeClasses = {
            sm: "w-8 h-8",
            md: "w-10 h-10",
            lg: "w-12 h-12",
        };
        
        if (imageUrl) {
            return (
                <img
                    src={imageUrl}
                    alt={user?.name || "User"}
                    className={`${sizeClasses[size]} rounded-full object-cover`}
                    onError={(e) => {
                        e.target.style.display = "none";
                        if (showFallback && e.target.parentElement) {
                            const initials = getUserInitials();
                            e.target.parentElement.innerHTML = `
                                <div class="${sizeClasses[size]} bg-black rounded-full flex items-center justify-center">
                                    <span class="text-white text-sm font-semibold">${initials}</span>
                                </div>
                            `;
                        }
                    }}
                />
            );
        }
        
        return (
            <div className={`${sizeClasses[size]} bg-black rounded-full flex items-center justify-center`}>
                <span className="text-white text-sm font-semibold">
                    {getUserInitials()}
                </span>
            </div>
        );
    };

    return (
        <>
            {/* HEADER */}
            <header className={`py-3 bg-white sticky top-0 z-50 ${!isDashboard && 'md:shadow-sm'}`}>
                <div className={`${isDashboard ? "px-6 flex items-center justify-between" : "max-w-7xl px-4 mx-auto flex items-center justify-between"}`}>

                    {/* Logo - Hidden on mobile, visible on desktop */}
                    <Link href="/" className={`${isDashboard ? "flex items-center space-x-2 ml-0 md:ml-12 lg:ml-0" : "flex items-center space-x-2"} hidden md:block`}>
                        <Image src="/logo.png" alt="Logo" width={100} height={50} />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className={`${`${isDashboard ? "hidden" : "hidden md:block"}`}`}>
                        <ul className="flex space-x-12 text-gray-700 font-medium">
                            <li><Link href="/" className="hover:text-brandColor">Home</Link></li>
                            <li><Link href="/shop" className="hover:text-brandColor">Shop</Link></li>
                            <li><Link href="/subscription" className="hover:text-brandColor">Subscription</Link></li>
                        </ul>
                    </nav>

                    {/* Desktop Right Side */}
                    <div className="hidden md:flex items-center space-x-4">

                        {/* Cart */}
                        <Link href="/cart" className="relative mt-0.5">
                            <ShoppingBag className="text-gray-700" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative group">
                                {/* 🔥 FIXED: Avatar with proper image handling */}
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
                                                            parent.innerHTML = `<span class="text-white text-sm font-semibold">${getUserInitials()}</span>`;
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

                                    {/* User Info Section */}
                                    <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            {/* 🔥 FIXED: Dropdown avatar */}
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
                                                                        parent.innerHTML = `<span class="text-white text-base font-semibold">${getUserInitials()}</span>`;
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

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        {/* Dashboard Link */}
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

                                        {/* Divider */}
                                        <div className="my-1 border-t border-gray-100 mx-4"></div>

                                        {/* Logout Button */}
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
                        )}
                    </div>

                    {/* Mobile Menu Button - Always on right side */}
                    <button
                        onClick={() => setOpen(true)}
                        className="md:hidden text-gray-700 ml-auto"
                    >
                        <Menu size={26} className="cursor-pointer" />
                    </button>
                </div>
            </header>

            {/* BACKDROP WITH BLUR */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 transition-opacity"
                />
            )}

            {/* LEFT DRAWER */}
            <div
                className={`fixed top-0 left-0 h-full w-80 bg-white z-[999] shadow-xl
                transform transition-transform duration-300 ease-out
                ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Menu</h3>
                    <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <X size={24} className="text-gray-700 cursor-pointer" />
                    </button>
                </div>

                {/* Drawer Links */}
                <nav className="px-5 py-4 space-y-4 text-gray-700">

                    <Link href="/" onClick={() => setOpen(false)} className="block py-2 hover:text-gray-900 transition">
                        Home
                    </Link>

                    <Link href="/shop" onClick={() => setOpen(false)} className="block py-2 hover:text-gray-900 transition">
                        Shop
                    </Link>

                    <Link href="/subscription" onClick={() => setOpen(false)} className="block py-2 hover:text-gray-900 transition">
                        Subscription
                    </Link>

                    {/* Cart - Inside drawer for mobile */}
                    <Link
                        href="/cart"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between py-2 border-t border-gray-200 pt-4 mt-2 hover:text-gray-900 transition"
                    >
                        <div className="flex items-center gap-2">
                            <ShoppingBag size={18} />
                            <span>Cart</span>
                        </div>
                        {cartCount > 0 && (
                            <span className="bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* 🔥 MOBILE AUTH CHECK - FIXED */}
                    {user ? (
                        <>
                            {/* Mobile User Info */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl mt-4">
                                <div className="flex items-center gap-3">
                                    {/* 🔥 FIXED: Mobile drawer avatar */}
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
                                                                parent.innerHTML = `<span class="text-white text-base font-semibold">${getUserInitials()}</span>`;
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
                                            <p className="font-semibold text-gray-800 capitalize">
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
                                                {getProviderText()} account
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`${user?.role === "admin" ? "/dashboard/admin" : "/dashboard/user"}`}
                                onClick={() => setOpen(false)}
                                className="block w-full px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-center font-medium"
                            >
                                Dashboard
                            </Link>

                            <button
                                onClick={handleLogout}
                                disabled={loading}
                                className="w-full text-left px-4 py-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center font-medium"
                            >
                                {loading ? "Logging out..." : "Logout"}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-3 mt-4">
                            <Link
                                href="/login"
                                onClick={() => setOpen(false)}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition"
                            >
                                Sign In
                            </Link>

                            <Link
                                href="/signup"
                                onClick={() => setOpen(false)}
                                className="block w-full bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition text-center"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}

                </nav>
            </div>
        </>
    );
}