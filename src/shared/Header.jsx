"use client";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
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
                        <li>
                            <Link href="/" className="text-gray-700 hover:text-[var(--brandColor,#3074B5)] transition-colors">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/shop" className="text-gray-700 hover:text-[var(--brandColor,#3074B5)] transition-colors">
                                Shop
                            </Link>
                        </li>
                        <li>
                            <Link href="/subscription" className="text-gray-700 hover:text-[var(--brandColor,#3074B5)] transition-colors">
                                Subscription
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Buttons */}
                <div className="flex items-center space-x-3">
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
