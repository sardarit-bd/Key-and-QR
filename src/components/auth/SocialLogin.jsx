"use client";

import { Apple } from "lucide-react";

export default function SocialLogin() {
    const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const handleGoogleLogin = () => {
        window.location.href = `${backendUrl}/api/v1/auth/google`;
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                        Or continue with
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Google */}
                <button
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition cursor-pointer"
                >
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    <span>Google</span>
                </button>

                {/* Apple (disabled) */}
                <button
                    disabled
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md opacity-50 cursor-not-allowed"
                >
                    <Apple size={18} />
                    <span>Apple (Coming Soon)</span>
                </button>
            </div>
        </div>
    );
}