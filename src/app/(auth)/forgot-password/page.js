"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
    const { forgotPassword, loading } = useAuthStore();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting || loading) return;
        
        setError("");
        
        if (!email.trim()) {
            const errorMsg = "Email is required";
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await forgotPassword(email);
            
            if (result.success) {
                setSubmitted(true);
                toast.success("Reset link sent to your email!");
            } else {
                // User-friendly error message
                const errorMsg = result.error === "User not found with this email" 
                    ? "No account found with this email address." 
                    : "Failed to send reset email. Please try again.";
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

    return (
        <div className="p-3">
            <div className="max-w-md mx-auto my-36 p-6 border border-gray-400 rounded-xl shadow-sm bg-white">
                <h2 className="text-2xl font-semibold mb-2 text-center">Reset Password</h2>
                <p className="text-gray-500 text-sm text-center mb-6">
                    Enter your email and we'll send you a reset link
                </p>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                {submitted ? (
                    // Success State
                    <div className="text-center">
                        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
                            <p className="font-medium">Reset link sent!</p>
                            <p className="text-sm mt-2">
                                Check your email ({email}) for password reset instructions.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition"
                        >
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            className="w-full border border-gray-400 px-4 py-2 rounded-md mb-4 focus:outline-gray-400"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isSubmitting || loading}
                            aria-label="Email address"
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
                                    Sending...
                                </span>
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </form>
                )}

                <p className="text-center pt-4 text-gray-500">
                    Remember your password?{" "}
                    <Link className="text-gray-900 font-medium hover:underline" href="/login">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}