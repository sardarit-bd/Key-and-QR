"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import SocialLogin from "@/components/auth/SocialLogin";
import { useAuthStore } from "@/store/authStore";
import { useRegisterMutation } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Check, Circle, X } from "lucide-react";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center">Loading...</div>}>
      <SignUpPageContent />
    </Suspense>
  );
}

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard/user";
  
  const { user } = useAuthStore();
  const registerMutation = useRegisterMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time password requirement tracker
  const passwordRules = useMemo(() => {
    return [
      { id: "min", label: "8+ characters", valid: password.length >= 8 },
      { id: "upper", label: "Uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
      { id: "lower", label: "Lowercase letter (a-z)", valid: /[a-z]/.test(password) },
      { id: "number", label: "At least one number (0-9)", valid: /\d/.test(password) },
    ];
  }, [password]);

  const isPasswordValid = useMemo(() => {
    return passwordRules.every((rule) => rule.valid);
  }, [passwordRules]);

  // Real-time confirm password match tracker
  const isConfirmNotEmpty = confirmPassword.length > 0;
  const isPasswordMatched = isConfirmNotEmpty && password === confirmPassword;
  const isPasswordMismatched = isConfirmNotEmpty && password !== confirmPassword;

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        const safeRedirect = redirectPath.startsWith("/dashboard/admin") || redirectPath.startsWith("/admin")
          ? "/dashboard/user"
          : redirectPath;
        router.push(safeRedirect);
      }
    }
  }, [user, router, redirectPath]);

  // Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting || registerMutation.isPending) return;
    
    setError("");

    if (name.trim().length < 2) {
      const errorMsg = "Name must be at least 2 characters";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!isPasswordValid) {
      const errorMsg = "Please meet all password requirements before signing up";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (password !== confirmPassword) {
      const errorMsg = "Passwords do not match";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerMutation.mutateAsync({ name: name.trim(), email: email.trim(), password });

      if (result?.success) {
        if (result.guestClaimed) {
          toast.success("🎉 Your guest purchases have been claimed!");
        }
      }
    } catch (error) {
      console.error("[Registration Error]:", error);
      const errorMessage =
        error?.response?.data?.message ||
        (Array.isArray(error?.response?.data?.data) ? error.response.data.data[0] : null) ||
        error?.message ||
        "Registration failed. Please check your details and try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
      
      {/* ************* Sign Up Card - Glass Effect ************* */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.25, 0.1, 0.1, 1],
          delay: 0.1 
        }}
        className="relative z-10 w-[90%] sm:w-[440px] md:w-[460px] lg:w-[480px]"
      >
        <Card className="bg-white/85 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl text-center font-semibold text-gray-900 mb-6">
              Create Account
            </h2>

            {/* ************* Error Display ************* */}
            {error && (
              <div className="bg-red-50/90 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <input
                  type="text"
                  className="w-full border border-gray-300/60 bg-white/80 px-4 py-3 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent
                             transition-all duration-200 placeholder:text-gray-400 text-sm"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  disabled={isSubmitting || registerMutation.isPending}
                  aria-label="Full name"
                />
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  className="w-full border border-gray-300/60 bg-white/80 px-4 py-3 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent
                             transition-all duration-200 placeholder:text-gray-400 text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting || registerMutation.isPending}
                  aria-label="Email address"
                />
              </div>

              {/* Password with Visibility Toggle */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full border border-gray-300/60 bg-white/80 pl-4 pr-11 py-3 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent
                               transition-all duration-200 placeholder:text-gray-400 text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting || registerMutation.isPending}
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Real-time Password Checklist */}
                <div className="mt-2.5 p-3 bg-gray-50/70 border border-gray-200/60 rounded-xl space-y-1.5">
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Password Requirements:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {passwordRules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`flex items-center gap-1.5 text-[11.5px] transition-colors duration-150 ${
                          rule.valid
                            ? "text-emerald-600 font-medium"
                            : "text-gray-400"
                        }`}
                      >
                        {rule.valid ? (
                          <Check size={13} className="shrink-0 text-emerald-600 stroke-[3]" />
                        ) : (
                          <Circle size={10} className="shrink-0 text-gray-300 stroke-[2.5]" />
                        )}
                        <span>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirm Password with Visibility Toggle & Match Indicator */}
              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`w-full border bg-white/80 pl-4 pr-11 py-3 rounded-lg 
                               focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 text-sm ${
                                 isPasswordMismatched
                                   ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                                   : isPasswordMatched
                                   ? "border-emerald-300 focus:ring-emerald-200 focus:border-emerald-400"
                                   : "border-gray-300/60 focus:ring-black/20 focus:border-transparent"
                               }`}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isSubmitting || registerMutation.isPending}
                    aria-label="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Real-time Match / Mismatch Feedback */}
                {isConfirmNotEmpty && (
                  <div
                    className={`mt-1.5 flex items-center gap-1.5 text-[11.5px] transition-colors duration-150 ${
                      isPasswordMatched
                        ? "text-emerald-600 font-medium"
                        : "text-red-500 font-medium"
                    }`}
                  >
                    {isPasswordMatched ? (
                      <>
                        <Check size={13} className="shrink-0 text-emerald-600 stroke-[3]" />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X size={13} className="shrink-0 text-red-500 stroke-[2.5]" />
                        <span>Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting || registerMutation.isPending}
                whileHover={!(isSubmitting || registerMutation.isPending) ? { scale: 1.01 } : {}}
                whileTap={!(isSubmitting || registerMutation.isPending) ? { scale: 0.98 } : {}}
                className={`w-full bg-black text-white py-3.5 rounded-lg 
                           transition-all duration-300 hover:shadow-lg
                           text-base font-medium mt-2
                           ${(isSubmitting || registerMutation.isPending) 
                             ? "bg-gray-400 cursor-not-allowed hover:shadow-none" 
                             : "hover:bg-gray-800 cursor-pointer"
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
              </motion.button>
            </form>

            {/* ************* Social Login ************* */}
            <div className="mt-6">
              <SocialLogin />
            </div>

            {/* ************* Login Link ************* */}
            <p className="text-center pt-5 text-gray-500 text-sm">
              Already have an account?{" "}
              <Link 
                className="text-gray-900 font-medium hover:underline transition-colors duration-200" 
                href={`/login${redirectPath ? `?redirect=${redirectPath}` : ''}`}
              >
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}