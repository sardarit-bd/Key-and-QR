"use client";

import Image from "next/image";
import Link from "next/link";

export default function OrderSuccess() {
    return (
        <section className="max-w-4xl mx-auto py-4 px-4 text-center animate-fadeIn">

            {/* Top Confirmation Box */}
            <div className="bg-gray-100 rounded-xl py-10 px-6 shadow-sm border border-gray-200/60 transition-all duration-300 hover:shadow-md">
                <div className="flex justify-center mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-12 h-12 text-gray-800 animate-pop"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight">Order Confirmed!</h1>

                <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                    Thank you! Your QR Keychain is now being prepared with care.
                </p>
            </div>

            {/* Product Preview Section */}
            <div className="bg-gray-100 rounded-xl py-10 px-6 shadow-sm border border-gray-200/60 mt-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center justify-center transition-all duration-300 hover:shadow-md">

                {/* Left — Keychain */}
                <div className="flex justify-center animate-fadeUp delay-100">
                    <Image
                        src="/key.png"
                        alt="QR Keychain"
                        width={280}
                        height={280}
                        className="object-contain drop-shadow-sm hover:scale-[1.02] transition-transform"
                    />
                </div>

                {/* Right — Phone Preview */}
                <div className="flex justify-center animate-fadeUp delay-200">
                    <Image
                        src="/mobile.png"
                        alt="Phone QR Preview"
                        width={180}
                        height={450}
                        className="object-contain drop-shadow-sm hover:scale-[1.02] transition-transform"
                    />
                </div>

                {/* QR + Details */}
                <div className="md:col-span-2 text-center mt-2 w-full animate-fadeUp delay-300">
                    <p className="font-semibold text-gray-800 tracking-wide">
                        QR Code:{" "}
                        <span className="text-black font-bold">
                            QR-1762929219147-GO5KBHDZI
                        </span>
                    </p>

                    <p className="text-gray-600 text-sm max-w-xl mx-auto mt-3 leading-relaxed">
                        This unique QR code has been assigned to your keychain and will be engraved before shipping.
                        <span className="font-semibold text-black">
                            {" "}Scan it now to preview your motivational quote!
                        </span>
                    </p>

                    {/* View Quote Button */}
                    <div className="mt-8 flex justify-center">
                        <Link
                            href="/your-quote"
                            className="bg-gray-800 block w-full text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-all text-sm shadow-sm hover:shadow-md"
                        >
                            View Your Quote
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
