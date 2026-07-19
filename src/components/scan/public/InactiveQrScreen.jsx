"use client";

import { PauseCircle } from "lucide-react";
import Link from "next/link";

export default function InactiveQrScreen({ tagCode }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PauseCircle size={28} className="text-white" />
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    This QR Code Isn&apos;t Active
                </h1>

                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    This InspireTag isn&apos;t ready to be scanned right now.
                    It may be disabled or still waiting to be set up.
                </p>

                {tagCode && (
                    <div className="bg-gray-100 rounded-lg p-3 mb-6 text-left">
                        <p className="text-xs text-gray-500 font-medium mb-1">
                            Scanned code:
                        </p>
                        <p className="text-xs font-mono text-gray-600 bg-white rounded px-2 py-1 inline-block break-all border border-gray-200">
                            {tagCode}
                        </p>
                    </div>
                )}

                <Link
                    href="/"
                    className="inline-flex w-full items-center justify-center h-11 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
                >
                    Go to Homepage
                </Link>
            </div>
        </div>
    );
}