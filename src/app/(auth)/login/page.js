// app/(auth)/login/page.js

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import SocialLogin from "@/components/auth/SocialLogin";
import { useAuthStore } from "@/store/authStore";
import { useLoginMutation } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard/user";
  
  const { user, isInitialized } = useAuthStore();
  const loginMutation = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle OAuth errors from URL
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

    const errorMessages = {
      google_auth_failed: "Google login failed. Please try again.",
      social_login_failed: "Social login failed. Please try again.",
      apple_auth_failed: "Apple login failed. Please try again.",
      auth_failed: "Authentication failed. Please try again.",
      invalid_callback: "Invalid callback data. Please try again.",
      callback_processing_failed: "Failed to process login. Please try again.",
    };

    const errorMsg = errorMessages[errorParam] || "Login failed. Please try again.";
    setError(errorMsg);
    toast.error(errorMsg);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isInitialized && user) {
      const target = user.role === "admin" ? "/dashboard/admin" : redirectPath;
      router.replace(target);
    }
  }, [user, isInitialized, router, redirectPath]);

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (isSubmitting || loginMutation.isPending) return;
    
    setError("");
    
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

    setIsSubmitting(true);

    try {
      const result = await loginMutation.mutateAsync({ email, password });

      if (result?.success) {
        if (result.guestClaimed) {
          toast.success(`🎉 Claimed ${result.guestOrders || 0} orders and ${result.guestTags || 0} tags!`);
        }
      }
    } catch (error) {
      const errorMsg = error.message || "Invalid email or password!";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  return (
    // ************* Full-Screen Background Container *************
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url('/login/login-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      {/* ************* Dark Overlay ************* */}
      <div className="absolute inset-0 bg-white/40" />
      
      {/* ************* Toaster - Positioned above everything ************* */}
      <Toaster position="top-right" />

      {/* ************* Logo - Top Left ************* */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.25, 0.1, 0.1, 1],
          delay: 0.2 
        }}
        className="absolute top-6 left-10 md:top-8 md:left-8 lg:top-10 lg:left-30 z-20"
      >
        <Link href="/" className="block hover:opacity-80 transition-opacity duration-200">
          <Image
            src="/logo/logo.png"
            alt="QKey Logo"
            width={140}
            height={50}
            className="w-[100px] sm:w-[120px] md:w-[140px] h-auto object-contain"
            priority
          />
        </Link>
      </motion.div>
      
      {/* ************* Login Card - Glass Effect with Animation ************* */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.25, 0.1, 0.1, 1],
          delay: 0.1 
        }}
        className="relative z-10 w-[90%] sm:w-[420px] md:w-[440px] lg:w-[460px]"
      >
        <Card className="bg-white/85 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl text-center font-semibold text-gray-900 mb-6">
              Welcome Back
            </h2>

            {/* ************* Error Display ************* */}
            {error && (
              <div className="bg-red-50/90 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                className="w-full border border-gray-300/60 bg-white/80 px-4 py-3 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent
                           transition-all duration-200 placeholder:text-gray-400"
                placeholder="Email address"
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={isSubmitting || loginMutation.isPending}
                aria-label="Email address"
              />

              <input
                type="password"
                className="w-full border border-gray-300/60 bg-white/80 px-4 py-3 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent
                           transition-all duration-200 placeholder:text-gray-400"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                required
                disabled={isSubmitting || loginMutation.isPending}
                aria-label="Password"
              />

              <motion.button
                type="submit"
                disabled={isSubmitting || loginMutation.isPending}
                whileHover={!(isSubmitting || loginMutation.isPending) ? { scale: 1.02 } : {}}
                whileTap={!(isSubmitting || loginMutation.isPending) ? { scale: 0.98 } : {}}
                className={`w-full bg-black text-white py-3.5 rounded-lg 
                           transition-all duration-300 hover:shadow-lg
                           text-base font-medium
                           ${(isSubmitting || loginMutation.isPending) 
                             ? "bg-gray-400 cursor-not-allowed hover:shadow-none" 
                             : "hover:bg-gray-800 cursor-pointer"
                           }`}
              >
                {(isSubmitting || loginMutation.isPending) ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </form>

            {/* ************* Forgot Password Link ************* */}
            <div className="text-center mt-4">
              <Link
                href="/forgot-password"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
              >
                Forgot Password?
              </Link>
            </div>

            {/* ************* Social Login ************* */}
            <div className="mt-2">
              <SocialLogin />
            </div>

            {/* ************* Register Link ************* */}
            <p className="text-center pt-5 text-gray-500 text-sm">
              Don't have an account?{" "}
              <Link 
                className="text-gray-900 font-medium hover:underline transition-colors duration-200" 
                href={`/signup${redirectPath ? `?redirect=${redirectPath}` : ''}`}
              >
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}