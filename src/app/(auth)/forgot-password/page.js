"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const { forgotPassword, loading } = useAuthStore();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const success = await forgotPassword(email);

        if (success) {
            setSubmitted(true);
        } else {
            setError("Failed to send reset email. Please try again.");
        }
    };

    return (
        <div className="p-3">
            <div className="max-w-md mx-auto my-36 p-6 border border-gray-400 rounded-xl shadow-sm bg-white">
                <h2 className="text-2xl font-semibold mb-2 text-center">Reset Password</h2>
                <p className="text-gray-500 text-sm text-center mb-6">
                    Enter your email and we'll send you a reset link
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                {submitted ? (
                    <div className="text-center">
                        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
                            <p className="font-medium">Reset link sent!</p>
                            <p className="text-sm mt-2">
                                Check your email ({email}) for password reset instructions.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800"
                        >
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            className="w-full border border-gray-400 px-4 py-2 rounded-md mb-4"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <p className="text-center pt-4 text-gray-500">
                    Remember your password?{" "}
                    <Link className="text-gray-900 font-medium" href="/login">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}