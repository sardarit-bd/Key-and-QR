"use client";

import SocialLogin from "@/components/auth/SocialLogin";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignUpPage() {
    const router = useRouter();
    const { user, register, loading, error: storeError } = useAuthStore();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            router.push("/dashboard/user");
        }
    }, [user, router]);

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

        const userData = await register({ name, email, password });

        if (!userData) {
            setError(storeError || "Registration failed");
        }
    };

    return (
        <div className="p-3">
            <div className="max-w-md mx-auto my-36 p-6 border border-gray-400 rounded-xl shadow-sm bg-white">
                <h2 className="text-2xl font-semibold mb-4 text-center">Create Account</h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="w-full border border-gray-400 px-4 py-2 rounded-md mb-3 focus:outline-gray-400"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        minLength={2}
                    />

                    <input
                        type="email"
                        className="w-full border border-gray-400 px-4 py-2 rounded-md mb-3 focus:outline-gray-400"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        className="w-full border border-gray-400 px-4 py-2 rounded-md mb-3 focus:outline-gray-400"
                        placeholder="Password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />

                    <input
                        type="password"
                        className="w-full border border-gray-400 px-4 py-2 rounded-md mb-4 focus:outline-gray-400"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-3 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                {/* Social Login */}
                <div className="mt-6">
                    <SocialLogin />
                </div>

                <p className="text-center pt-3 text-gray-500">
                    Already have an account?{" "}
                    <Link className="text-gray-900 font-medium" href="/login">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}