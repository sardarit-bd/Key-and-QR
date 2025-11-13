"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

export default function Header() {
    const cart = useCartStore((state) => state.cart);
    const { user, logout } = useAuthStore();

    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

    const [open, setOpen] = useState(false);

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
                <div className="container mx-auto px-4 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <Image src="/logo.png" alt="Logo" width={100} height={50} />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:block">
                        <ul className="flex space-x-12 text-gray-700 font-medium">
                            <li><Link href="/" className="hover:text-brandColor">Home</Link></li>
                            <li><Link href="/shop" className="hover:text-brandColor">Shop</Link></li>
                            <li><Link href="/subscription" className="hover:text-brandColor">Subscription</Link></li>
                        </ul>
                    </nav>

                    {/* Desktop Right Side */}
                    <div className="hidden md:flex items-center space-x-4">

                        {/* Cart */}
                        <Link href="/cart" className="relative">
                            <ShoppingBag className="text-gray-700" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        {user ? (
                            <div className="relative group">
                                {/* Avatar */}
                                <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shadow-sm">
                                    <User size={20} className="text-gray-700" />
                                </button>

                                {/* Dropdown */}
                                <div className="absolute right-0 mt-3 w-44 bg-white shadow-lg rounded-lg p-2 
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">

                                    <p className="px-3 py-1 text-sm text-gray-600">{user.name}</p>

                                    <Link
                                        href="/user"
                                        className="block px-3 py-2 rounded hover:bg-gray-100"
                                    >
                                        Dashboard
                                    </Link>

                                    <button
                                        onClick={logout}
                                        className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-red-600"
                                    >
                                        Logout
                                    </button>
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
                        <Menu size={26} />
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
                className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl
                transform transition-transform duration-300 ease-out
                ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b">
                    <h3 className="text-lg font-semibold">Menu</h3>
                    <button onClick={() => setOpen(false)}>
                        <X size={26} className="text-gray-700" />
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
                        className="flex items-center gap-2 border-t pt-3 hover:text-brandColor"
                    >
                        <ShoppingBag />
                        <span>Cart ({cartCount})</span>
                    </Link>

                    {/* 🔥 MOBILE AUTH CHECK */}
                    {user ? (
                        <>
                            <Link
                                href="/user"
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
                                className="w-full text-left px-4 py-2 mt-2 rounded-md border text-red-600"
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
