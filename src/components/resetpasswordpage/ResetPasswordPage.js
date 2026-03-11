"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const { resetPassword, loading } = useAuthStore();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            router.push("/forgot-password");
        }
    }, [token, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        const success = await resetPassword(token, password);

        if (success) {
            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } else {
            setError("Failed to reset password. Link may have expired.");
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

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                {success ? (
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
                            className="w-full border border-gray-400 px-4 py-2 rounded-md mb-3"
                            placeholder="New password (min. 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />

                        <input
                            type="password"
                            className="w-full border border-gray-400 px-4 py-2 rounded-md mb-4"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <p className="text-center pt-4 text-gray-500">
                    <Link className="text-gray-900 font-medium" href="/login">
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}