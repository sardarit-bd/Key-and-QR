"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function SubscriptionCancelPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle size={40} className="text-yellow-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription Cancelled</h1>
                <p className="text-gray-600 mb-6">
                    You have cancelled the subscription process. No charges were made.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/subscription"
                        className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition"
                    >
                        Try Again
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}