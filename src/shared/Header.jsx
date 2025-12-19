"use client";

import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { CircleUserRound, LayoutDashboard, LogOut, Menu, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";


export default function Header() {
    const cart = useCartStore((state) => state.cart);
    const { user, logout } = useAuthStore();
    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const isDashboard = pathname.startsWith("/dashboard");

    console.log(isDashboard);



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


    return (
        <>
            {/* HEADER */}
            <header className="shadow-sm py-3 bg-white sticky top-0 z-50">
                <div className={`${isDashboard ? "px-6 flex items-center justify-between" : "max-w-7xl px-4 mx-auto flex items-center justify-between"}`}>

                    {/* Logo */}
                    <Link href="/" className={`${isDashboard ? "flex items-center space-x-2 ml-12 lg:ml-0" : "flex items-center space-x-2"}`}>
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
                                {/* Avatar */}
                                <CircleUserRound size={36} className="text-gray-800" />

                                {/* Dropdown */}
                                {/* Improved Dropdown */}
                                <div className="absolute right-0 mt-2 w-64 bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100 
opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">

                                    {/* User Info Section */}
                                    <div className="px-4 py-4 bg-gray-100 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                                                <CircleUserRound size={22} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                                <p className="text-xs text-gray-500">View Profile</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-0">
                                        {/* Dashboard Link */}
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                                <LayoutDashboard size={18} className="text-gray-600 group-hover:text-gray-600 transition-colors" />
                                            </div>
                                            <span className="text-sm font-medium">Dashboard</span>
                                        </Link>

                                        {/* Divider */}
                                        <div className="my-1 border-t border-gray-100"></div>

                                        {/* Logout Button */}
                                        <button
                                            onClick={logout}
                                            className="flex items-center gap-3 px-4 py-2 w-full text-gray-700 hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                                <LogOut size={18} className="text-gray-600" />
                                            </div>
                                            <span className="text-sm font-medium">Logout</span>
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
                                    className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-[#255a90] transition"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setOpen(true)}
                        className="md:hidden text-gray-700"
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
                className={`fixed top-0 left-0 h-full w-72 bg-white z-[999] shadow-xl
                transform transition-transform duration-300 ease-out
                ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-300">
                    <h3 className="text-lg font-semibold">Menu</h3>
                    <button onClick={() => setOpen(false)}>
                        <X size={26} className="text-gray-700 cursor-pointer" />
                    </button>
                </div>

                {/* Drawer Links */}
                <nav className="px-4 py-4 space-y-4 text-gray-700">

                    <Link href="/" onClick={() => setOpen(false)} className="block hover:text-brandColor">
                        Home
                    </Link>

                    <Link href="/shop" onClick={() => setOpen(false)} className="block hover:text-brandColor">
                        Shop
                    </Link>

                    <Link href="/subscription" onClick={() => setOpen(false)} className="block hover:text-brandColor">
                        Subscription
                    </Link>

                    {/* Cart */}
                    <Link
                        href="/cart"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 border-t border-gray-300 pt-3 hover:text-brandColor"
                    >
                        <ShoppingBag />
                        <span>Cart ({cartCount})</span>
                    </Link>

                    {/* 🔥 MOBILE AUTH CHECK */}
                    {user ? (
                        <>
                            <Link
                                href="/dashboard"
                                onClick={() => setOpen(false)}
                                className="block w-full px-4 py-2 rounded-md bg-gray-200"
                            >
                                Dashboard
                            </Link>

                            <button
                                onClick={() => {
                                    logout();
                                    setOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 mt-2 rounded-md border text-red-600 cursor-pointer"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                onClick={() => setOpen(false)}
                                className="block w-full px-4 py-2 border rounded-md mt-4"
                            >
                                Sign In
                            </Link>

                            <Link
                                href="/signup"
                                onClick={() => setOpen(false)}
                                className="block w-full bg-gray-700 text-white px-4 py-2 rounded-md"
                            >
                                Get Started
                            </Link>
                        </>
                    )}

                </nav>
            </div>
        </>
    );
}
