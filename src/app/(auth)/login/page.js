"use client";

import SocialLogin from "@/components/auth/SocialLogin";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading, error: storeError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Check for OAuth error in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");
    if (errorParam) {
      setError(errorParam === "google_auth_failed"
        ? "Google login failed. Please try again."
        : "Apple login failed. Please try again.");
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/user");
      }
    }
  }, [user, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login({ email, password });

    if (result?.success) {
      if (result.user?.role === "admin") {
        window.location.href = "/dashboard/admin";
      } else {
        window.location.href = "/dashboard/user";
      }
    } else {
      setError(result?.error || "Invalid email or password!");
    }
  };

  return (
    <div className="p-3">
      <div className="max-w-md mx-auto my-36 p-6 border border-gray-400 rounded-xl shadow-sm bg-white">
        <h2 className="text-2xl text-center font-semibold mb-4">Sign In</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            className="w-full border border-gray-400 px-4 py-2 rounded-md mb-3 focus:outline-gray-400"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full border border-gray-400 px-4 py-2 rounded-md mb-4 focus:outline-gray-400"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Social Login */}
        <div className="mt-6">
          <SocialLogin />
        </div>

        <p className="text-center pt-3 text-gray-500">
          Don't have an account?{" "}
          <Link className="text-gray-900 font-medium" href="/signup">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}