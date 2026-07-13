"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    
    const { resetPassword, loading } = useAuthStore();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validate token on load
    useEffect(() => {
        if (!token) {
            router.push("/forgot-password");
        }
    }, [token, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting || loading) return;
        
        setError("");

        // Client-side validation
        if (password !== confirmPassword) {
            const errorMsg = "Passwords do not match";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (password.length < 6) {
            const errorMsg = "Password must be at least 6 characters";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await resetPassword(token, password);
            
            if (result.success) {
                setSuccess(true);
                toast.success("Password reset successfully!");
                
                // Redirect after 3 seconds
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } else {
                // User-friendly error message
                const errorMsg = result.error === "Invalid or expired reset token" 
                    ? "This reset link has expired or is invalid. Please request a new one." 
                    : "Password reset failed. Please try again.";
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (error) {
            const errorMsg = "Something went wrong. Please try again.";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return null;
    }

    return (
        <div className="p-3">
            <div className="max-w-md mx-auto my-36 p-6 border border-gray-400 rounded-xl shadow-sm bg-white">
                <h2 className="text-2xl font-semibold mb-2 text-center">Set New Password</h2>
                <p className="text-gray-500 text-sm text-center mb-6">
                    Enter your new password below
                </p>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                {success ? (
                    // Success State
                    <div className="text-center">
                        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
                            <p className="font-medium">Password reset successful!</p>
                            <p className="text-sm mt-2">Redirecting you to login...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="password"
                            className="w-full border border-gray-400 px-4 py-2 rounded-md mb-3 focus:outline-gray-400"
                            placeholder="New password (min. 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={isSubmitting || loading}
                            aria-label="New password"
                        />

                        <input
                            type="password"
                            className="w-full border border-gray-400 px-4 py-2 rounded-md mb-4 focus:outline-gray-400"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isSubmitting || loading}
                            aria-label="Confirm new password"
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className={`w-full bg-black text-white py-3 rounded-md transition-all duration-300 hover:bg-gray-800 ${
                                (isSubmitting || loading) 
                                    ? "bg-gray-400 cursor-not-allowed" 
                                    : "cursor-pointer"
                            }`}
                        >
                            {(isSubmitting || loading) ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Resetting...
                                </span>
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </form>
                )}

                <p className="text-center pt-4 text-gray-500">
                    <Link className="text-gray-900 font-medium hover:underline" href="/login">
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}