"use client";

import { UserQuotesList } from "@/components/user/quote/UserQuotesList";
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
    User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

// Category options - Black & White theme with colored icons
const CATEGORIES = [
    { id: "motivation", label: "Motivation", icon: Sparkles, iconColor: "text-orange-500" },
    { id: "love", label: "Love", icon: Heart, iconColor: "text-pink-500" },
    { id: "gratitude", label: "Gratitude", icon: MessageSquare, iconColor: "text-green-500" },
    { id: "faith", label: "Faith", icon: Tag, iconColor: "text-purple-500" },
    { id: "healing", label: "Healing", icon: Heart, iconColor: "text-blue-500" },
    { id: "other", label: "Other", icon: Quote, iconColor: "text-gray-500" },
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

            // Hide success message after 5 seconds
            setTimeout(() => {
                setSubmitSuccess(false);
            }, 5000);

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

    // Not logged in
    if (!user && !authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center transition-all duration-300 hover:shadow-2xl border border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
                    <p className="text-gray-500 mb-6">Please login to submit your inspirational quote</p>
                    <Link
                        href="/login?redirect=/submit-quote"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
                <Toaster 
                    position="top-right"
                />
                
                {/* Header - Black & White */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl shadow-lg mb-4 transition-all duration-300 hover:scale-105">
                        <Quote size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Share Your Inspiration
                    </h1>
                    <p className="text-gray-500">
                        Submit your favorite quote and inspire others
                    </p>
                </div>

                {/* Success Message - Black & White */}
                {submitSuccess && (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-gray-900 font-medium">Quote Submitted!</p>
                            <p className="text-gray-600 text-sm">
                                Your quote has been sent for review. You'll be notified once it's approved.
                            </p>
                        </div>
                    </div>
                )}

                {/* Form Card - Black & White */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl mb-8 border border-gray-200">
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
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none transition-all duration-200 ${error ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                                        }`}
                                />
                                <div className={`absolute bottom-3 right-3 text-xs transition-colors duration-200 ${charCount > 450 ? "text-orange-500" : "text-gray-400"
                                    }`}>
                                    {charCount}/500
                                </div>
                            </div>
                            {error && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle size={14} className="text-red-500" />
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Category Selection - Black & White with colored icons */}
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
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                                                isSelected
                                                    ? "bg-gray-900 text-white border-gray-900 shadow-md scale-[1.02]"
                                                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:scale-[1.01]"
                                            }`}
                                        >
                                            <Icon size={16} className={!isSelected ? cat.iconColor : "text-white"} />
                                            <span className="text-sm font-medium">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Choose the category that best fits your quote
                            </p>
                        </div>

                        {/* Submit Button - Black & White */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !quoteText.trim()}
                            className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
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

                {/* User's Submitted Quotes Section */}
                <div className="mt-8">
                    <UserQuotesList />
                </div>

                {/* Info Card - Black & White */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-start gap-3">
                        <Sparkles size={18} className="text-purple-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">How it works</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Your quote will be reviewed by our team. Once approved, it will appear in our collection
                                and may be shared with others who need inspiration. We appreciate your contribution!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Guidelines - Black & White */}
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Guidelines</h3>
                            <ul className="text-xs text-gray-600 space-y-1">
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