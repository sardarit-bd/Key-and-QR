"use client";

import SocialLogin from "@/components/auth/SocialLogin";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading, error: storeError, isInitialized } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Check for OAuth error in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");
    const sessionExpired = urlParams.get("session");

    if (sessionExpired === "expired") {
      const errorMsg = "Your session has expired. Please login again.";
      setError(errorMsg);
      toast.error(errorMsg);
    }

    if (!errorParam) return;

    let errorMsg = "";
    switch (errorParam) {
      case "google_auth_failed":
        errorMsg = "Google login failed. Please try again.";
        break;
      case "social_login_failed":
        errorMsg = "Social login failed. Please try again.";
        break;
      case "apple_auth_failed":
        errorMsg = "Apple login failed. Please try again.";
        break;
      case "auth_failed":
        errorMsg = "Authentication failed. Please try again.";
        break;
      default:
        errorMsg = "Login failed. Please try again.";
    }
    setError(errorMsg);
    toast.error(errorMsg);
  }, []);

  // Redirect if already logged in - Simplified
  useEffect(() => {
    if (isInitialized && user) {
      // toast.success(`Welcome back, ${user.email || 'User'}!`);
      if (user.role === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/dashboard/user");
      }
    }
  }, [user, isInitialized, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError("");
    
    // Basic validation
    if (!email.trim()) {
      const errorMsg = "Email is required";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    if (!password.trim()) {
      const errorMsg = "Password is required";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const result = await login({ email, password });

    if (!result?.success) {
      const errorMsg = result?.error || storeError || "Invalid email or password!";
      setError(errorMsg);
      toast.error(errorMsg);
    } else {
      // toast.success("Login successful! Redirecting...");
    }
  };

  // Clear error when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="p-3">
      <Toaster 
        position="top-right"
      />
      <div className="max-w-md mx-auto my-36 p-6 border border-gray-300 rounded-xl shadow-sm bg-white">
        <h2 className="text-2xl text-center font-semibold mb-4">Sign In</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            className="w-full border border-gray-300 px-4 py-2 rounded-md mb-3 focus:outline-gray-400"
            placeholder="Email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            disabled={loading}
          />

          <input
            type="password"
            className="w-full border border-gray-300 px-4 py-2 rounded-md mb-4 focus:outline-gray-400"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 hover:bg-gray-800"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-600 hover:text-gray-900 transition"
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
          <Link className="text-gray-900 font-medium hover:underline transition" href="/signup">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}