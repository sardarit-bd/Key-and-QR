"use client";

import { AlertTriangle } from "lucide-react";

export default function ScanErrorScreen({ message, onRetry }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={28} className="text-white" />
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Something Went Wrong
                </h1>

                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    {message || "We couldn't load this QR code right now. Please try again."}
                </p>

                <button
                    onClick={onRetry}
                    className="w-full h-11 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}