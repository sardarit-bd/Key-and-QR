"use client";

import api from "@/lib/api";
import Loader from "@/shared/Loader";
import { useAuthStore } from "@/store/authStore";
import {
    AlertCircle,
    CheckCircle,
    Heart,
    Loader2,
    MessageSquare,
    Quote,
    Send,
    Sparkles,
    Tag,
    User
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// Category options
const CATEGORIES = [
    { id: "motivation", label: "Motivation", icon: Sparkles, color: "bg-orange-100 text-orange-700", border: "border-orange-200" },
    { id: "love", label: "Love", icon: Heart, color: "bg-pink-100 text-pink-700", border: "border-pink-200" },
    { id: "gratitude", label: "Gratitude", icon: MessageSquare, color: "bg-green-100 text-green-700", border: "border-green-200" },
    { id: "faith", label: "Faith", icon: Tag, color: "bg-purple-100 text-purple-700", border: "border-purple-200" },
    { id: "healing", label: "Healing", icon: Heart, color: "bg-blue-100 text-blue-700", border: "border-blue-200" },
    { id: "other", label: "Other", icon: Quote, color: "bg-gray-100 text-gray-700", border: "border-gray-200" },
];

export default function SubmitQuotePage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuthStore();

    const [quoteText, setQuoteText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("motivation");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading && !user) {
            toast.error("Please login to submit a quote", {
                duration: 3000,
                icon: "🔐",
            });
            router.push("/login?redirect=/submit-quote");
        }
    }, [user, authLoading, router]);

    // Character count
    const handleQuoteChange = (e) => {
        const text = e.target.value;
        setQuoteText(text);
        setCharCount(text.length);

        // Clear error when user types
        if (error) setError("");
    };

    // Submit quote
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!quoteText.trim()) {
            setError("Please enter your quote");
            toast.error("Please enter your quote");
            return;
        }

        if (quoteText.length < 5) {
            setError("Quote must be at least 5 characters");
            toast.error("Quote must be at least 5 characters");
            return;
        }

        if (quoteText.length > 500) {
            setError("Quote cannot exceed 500 characters");
            toast.error("Quote cannot exceed 500 characters");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const response = await api.post("/pending-quotes/submit", {
                text: quoteText.trim(),
                category: selectedCategory,
            });

            console.log("Submit response:", response.data);

            setSubmitSuccess(true);
            toast.success("Quote submitted successfully! Awaiting admin approval.", {
                duration: 5000,
                icon: "✨",
            });

            // Reset form
            setQuoteText("");
            setCharCount(0);
            setSelectedCategory("motivation");

        } catch (err) {
            console.error("Error submitting quote:", err);
            const errorMessage = err.response?.data?.message || "Failed to submit quote. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (authLoading) {
        return <Loader text="Qkey..." size={50} fullScreen />;
    }



    // Not logged in - UPDATED to check user instead of accessToken
    if (!user && !authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center transition-all duration-300 hover:shadow-2xl">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
                    <p className="text-gray-500 mb-6">Please login to submit your inspirational quote</p>
                    <Link
                        href="/login?redirect=/submit-quote"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Login / Sign Up
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                {/* <button
                    onClick={() => router.back()}
                    className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-200 hover:translate-x-[-2px] cursor-pointer"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm">Back</span>
                </button> */}

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg mb-4 transition-all duration-300 hover:scale-105">
                        <Quote size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Share Your Inspiration
                    </h1>
                    <p className="text-gray-500">
                        Submit your favorite quote and inspire others
                    </p>
                </div>

                {/* Success Message */}
                {submitSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-green-800 font-medium">Quote Submitted!</p>
                            <p className="text-green-600 text-sm">
                                Your quote has been sent for review. You'll be notified once it's approved.
                            </p>
                        </div>
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        {/* Quote Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Quote *
                            </label>
                            <div className="relative">
                                <textarea
                                    value={quoteText}
                                    onChange={handleQuoteChange}
                                    placeholder="Write your inspirational quote here..."
                                    rows={5}
                                    maxLength={500}
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 ${error ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                                        }`}
                                />
                                <div className={`absolute bottom-3 right-3 text-xs transition-colors duration-200 ${charCount > 450 ? "text-orange-500" : "text-gray-400"
                                    }`}>
                                    {charCount}/500
                                </div>
                            </div>
                            {error && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle size={14} />
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Category Selection */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Choose Category *
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const isSelected = selectedCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer ${isSelected
                                                ? `${cat.color} ${cat.border} border-2 shadow-md scale-[1.02]`
                                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:scale-[1.01]"
                                                }`}
                                        >
                                            <Icon size={16} />
                                            <span className="text-sm font-medium">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Choose the category that best fits your quote
                            </p>
                        </div>

                        {/* User Info */}
                        {/* <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl transition-all duration-300 hover:shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                                    <User size={18} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.name || "User"}
                                    </p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                            </div>
                        </div> */}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !quoteText.trim()}
                            className="w-full py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-medium hover:from-gray-800 hover:to-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Submit Quote
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Info Card */}
                <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-start gap-3">
                        <Sparkles size={18} className="text-purple-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">How it works</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Your quote will be reviewed by our team. Once approved, it will appear in our collection
                                and may be shared with others who need inspiration. We appreciate your contribution!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Guidelines */}
                <div className="mt-4 p-4 bg-yellow-50/80 backdrop-blur-sm rounded-xl border border-yellow-200 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-yellow-800 mb-1">Guidelines</h3>
                            <ul className="text-xs text-yellow-700 space-y-1">
                                <li>• Keep quotes original and inspiring</li>
                                <li>• Avoid offensive or harmful content</li>
                                <li>• Maximum 500 characters</li>
                                <li>• Please credit the author if known</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}