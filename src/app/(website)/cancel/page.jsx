"use client";

import Link from "next/link";

export default function CancelPage() {
    return (
        <div className="max-w-7xl mx-auto py-32 px-4 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                        className="w-8 h-8 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                    Payment Cancelled
                </h1>
                <p className="text-gray-600 mb-6">
                    Your payment was cancelled. No charges were made to your account.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link
                        href="/checkout"
                        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition"
                    >
                        Try Again
                    </Link>
                    <Link
                        href="/cart"
                        className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
                    >
                        Return to Cart
                    </Link>
                </div>
            </div>
        </div>
    );
}