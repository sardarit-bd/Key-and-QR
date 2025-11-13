"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function Header() {
    const cart = useCartStore((state) => state.cart);

    return (
        <header className="shadow-sm py-3 bg-white sticky top-0 z-50">
            <div className="container mx-auto px-4 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <Image src="/logo.png" alt="Logo" width={100} height={50} />
                </Link>

                {/* Navigation */}
                <nav className="hidden md:block">
                    <ul className="flex space-x-12">
                        <li><Link href="/" className="hover:text-brandColor">Home</Link></li>
                        <li><Link href="/shop" className="hover:text-brandColor">Shop</Link></li>
                        <li><Link href="/subscription" className="hover:text-brandColor">Subscription</Link></li>
                    </ul>
                </nav>

                {/* Buttons */}
                <div className="flex items-center space-x-4">
                    {/* Cart */}
                    <Link href="/cart" className="relative">
                        <ShoppingBag className="text-gray-700" />

                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {cart.reduce((sum, i) => sum + i.qty, 0)}
                            </span>
                        )}
                    </Link>

                    <button className="text-gray-700 px-4 py-2 border rounded-md hover:bg-gray-700 hover:text-white transition">
                        Sign In
                    </button>
                    <button className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-[#255a90] transition">
                        Get Started
                    </button>
                </div>
            </div>
        </header>
    );
}
