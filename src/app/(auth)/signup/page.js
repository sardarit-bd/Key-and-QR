"use client";

import SocialLogin from "@/components/auth/SocialLogin";
import { useAuthStore } from "@/store/authStore";
import { useRegisterMutation } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard/user";
  
  const { user } = useAuthStore();
  const registerMutation = useRegisterMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const target = user.role === "admin" ? "/dashboard/admin" : redirectPath;
      router.push(target);
    }
  }, [user, router, redirectPath]);

  // Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting || registerMutation.isPending) return;
    
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

    if (name.length < 2) {
      const errorMsg = "Name must be at least 2 characters";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerMutation.mutateAsync({ name, email, password });

      if (result?.success) {
        // Show guest claim notification if applicable
        if (result.guestClaimed) {
          toast.success("🎉 Your guest purchases have been claimed!");
        }
        // Redirect handled by mutation onSuccess
      }
    } catch (error) {
      // Error handled by mutation onError
      const errorMsg = error.message || "Registration failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3">
      <div className="max-w-md mx-auto my-36 p-6 border border-gray-400 rounded-xl shadow-sm bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-center">Create Account</h2>

        {/* Error Display */}
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
            disabled={isSubmitting || registerMutation.isPending}
            aria-label="Full name"
          />

          <input
            type="email"
            className="w-full border border-gray-400 px-4 py-2 rounded-md mb-3 focus:outline-gray-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting || registerMutation.isPending}
            aria-label="Email address"
          />

          <input
            type="password"
            className="w-full border border-gray-400 px-4 py-2 rounded-md mb-3 focus:outline-gray-400"
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isSubmitting || registerMutation.isPending}
            aria-label="Password"
          />

          <input
            type="password"
            className="w-full border border-gray-400 px-4 py-2 rounded-md mb-4 focus:outline-gray-400"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting || registerMutation.isPending}
            aria-label="Confirm password"
          />

          <button
            type="submit"
            disabled={isSubmitting || registerMutation.isPending}
            className={`w-full bg-black text-white py-3 rounded-md transition-all duration-300 hover:bg-gray-800 ${
              (isSubmitting || registerMutation.isPending) 
                ? "bg-gray-400 cursor-not-allowed" 
                : "cursor-pointer"
            }`}
          >
            {(isSubmitting || registerMutation.isPending) ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Social Login */}
        <div className="mt-6">
          <SocialLogin />
        </div>

        {/* Login Link */}
        <p className="text-center pt-3 text-gray-500">
          Already have an account?{" "}
          <Link 
            className="text-gray-900 font-medium hover:underline" 
            href={`/login${redirectPath ? `?redirect=${redirectPath}` : ''}`}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}