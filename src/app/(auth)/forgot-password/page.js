"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";

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
            
            {/* ************* Toast Container ************* */}
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
            
            {/* ************* Forgot Password Card ************* */}
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
                        <h2 className="text-2xl md:text-3xl text-center font-semibold text-gray-900 mb-2">
                            Reset Password
                        </h2>
                        <p className="text-center text-gray-500 text-sm mb-6">
                            Enter your email and we'll send you a reset link
                        </p>

                        {/* ************* Error Display ************* */}
                        {error && (
                            <div className="bg-red-50/90 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
                                {error}
                            </div>
                        )}

                        {submitted ? (
                            // ************* Success State *************
                            <div className="text-center">
                                <div className="bg-green-50/90 text-green-700 p-4 rounded-lg mb-4 border border-green-200">
                                    <p className="font-medium">Reset link sent!</p>
                                    <p className="text-sm mt-2">
                                        Check your email ({email}) for password reset instructions.
                                    </p>
                                </div>
                                <Link
                                    href="/login"
                                    className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="email"
                                    className="w-full border border-gray-300/60 bg-white/80 px-4 py-3 rounded-lg 
                                               focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent
                                               transition-all duration-200 placeholder:text-gray-400"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isSubmitting || loading}
                                    aria-label="Email address"
                                />

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting || loading}
                                    whileHover={!(isSubmitting || loading) ? { scale: 1.02 } : {}}
                                    whileTap={!(isSubmitting || loading) ? { scale: 0.98 } : {}}
                                    className={`w-full bg-black text-white py-3.5 rounded-lg 
                                               transition-all duration-300 hover:shadow-lg
                                               text-base font-medium
                                               ${(isSubmitting || loading) 
                                                 ? "bg-gray-400 cursor-not-allowed hover:shadow-none" 
                                                 : "hover:bg-gray-800 cursor-pointer"
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
                                </motion.button>
                            </form>
                        )}

                        <p className="text-center pt-5 text-gray-500 text-sm">
                            Remember your password?{" "}
                            <Link className="text-gray-900 font-medium hover:underline transition-colors duration-200" href="/login">
                                Sign In
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}