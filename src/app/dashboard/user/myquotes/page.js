"use client";

import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
    ArrowRight,
    Bookmark,
    BookmarkCheck,
    Clock,
    Heart,
    Quote,
    RefreshCw,
    Share2,
    ShoppingBag,
    Sparkles,
    Tag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

// Category configuration with icons
const CATEGORIES = [
    { id: "motivation", label: "Motivation", icon: Sparkles, color: "bg-orange-100 text-orange-700" },
    { id: "love", label: "Love", icon: Heart, color: "bg-pink-100 text-pink-700" },
    { id: "gratitude", label: "Gratitude", icon: Bookmark, color: "bg-green-100 text-green-700" },
    { id: "faith", label: "Faith", icon: Tag, color: "bg-purple-100 text-purple-700" },
    { id: "healing", label: "Healing", icon: Heart, color: "bg-blue-100 text-blue-700" },
    { id: "random", label: "Random", icon: RefreshCw, color: "bg-gray-100 text-gray-700" },
];

export default function QuotePage() {
    const router = useRouter();
    const { user } = useAuthStore(); // 👈 Removed accessToken

    const [loading, setLoading] = useState(true);
    const [quote, setQuote] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("random");
    const [savedToFavorites, setSavedToFavorites] = useState(false);
    const [favoriteId, setFavoriteId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [greeting, setGreeting] = useState("Hello");
    const [userName, setUserName] = useState("");

    // Set greeting and user name
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");

        setUserName(user?.name?.split(" ")[0] || "there");
    }, [user]);

    // Fetch quote based on category
    const fetchQuote = async (category = null) => {
        try {
            setLoading(true);
            const categoryParam = category || selectedCategory;

            // API call to get random quote by category
            const response = await api.get(`/quotes/random?category=${categoryParam}`);
            console.log("Quote response:", response.data);

            // Handle different response structures
            const quoteData = response.data?.data || response.data;

            setQuote({
                text: quoteData.text,
                category: quoteData.category,
                author: quoteData.author || "InspireTag",
                id: quoteData._id || quoteData.id,
            });

            // Check if this quote is already in favorites
            if (quoteData._id || quoteData.id) {
                await checkFavoriteStatus(quoteData._id || quoteData.id);
            } else {
                setSavedToFavorites(false);
                setFavoriteId(null);
            }

        } catch (error) {
            console.error("Error fetching quote:", error);

            // Fallback quote if API fails
            setQuote({
                text: "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.",
                category: "motivation",
                author: "J.K. Rowling",
                id: "fallback",
            });
            toast.error("Could not load quote. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Check if quote is in favorites
    const checkFavoriteStatus = async (quoteId) => {
        if (!user || quoteId === "fallback") { // 👈 Check user instead of accessToken
            setSavedToFavorites(false);
            setFavoriteId(null);
            return;
        }

        try {
            const response = await api.get("/favorites/check", {
                params: { quoteId: quoteId }
            });

            console.log("Check favorite response:", response.data);

            const result = response.data?.data || response.data;
            const { isFavorite, favoriteId } = result || {};

            setSavedToFavorites(isFavorite || false);
            setFavoriteId(favoriteId || null);

        } catch (error) {
            console.error("Error checking favorite:", error);
            setSavedToFavorites(false);
            setFavoriteId(null);
        }
    };

    // Save quote to favorites
    const handleSaveToFavorites = async () => {
        if (!user) { // 👈 Check user instead of accessToken
            toast.error("Please login to save favorites");
            setTimeout(() => {
                router.push(`/login?redirect=/quote`);
            }, 1500);
            return;
        }

        if (!quote || quote.id === "fallback") {
            toast.error("Cannot save this quote");
            return;
        }

        setIsSaving(true);
        try {
            if (savedToFavorites) {
                console.log("Attempting to REMOVE favorite with ID:", favoriteId);
                if (!favoriteId) {
                    toast.error("Favorite ID not found");
                    return;
                }

                await api.delete(`/favorites/${favoriteId}`);
                setSavedToFavorites(false);
                setFavoriteId(null);
                toast.success("Removed from favorites", { icon: "💔" });
            } else {
                console.log("Attempting to ADD favorite for quote ID:", quote.id);
                const response = await api.post("/favorites", { quoteId: quote.id });
                console.log("Add favorite response:", response.data);

                const result = response.data?.data || response.data;
                setSavedToFavorites(true);
                setFavoriteId(result._id || result.id);
                toast.success("Saved to favorites", { icon: "❤️" });
            }
        } catch (error) {
            console.error("Error details:", {
                status: error.response?.status,
                message: error.response?.data?.message,
                data: error.response?.data
            });

            if (error.response?.status === 409) {
                toast.error("Quote already in favorites");
                // Force re-check the favorite status
                await checkFavoriteStatus(quote.id);
            } else {
                toast.error(error.response?.data?.message || "Failed to save to favorites");
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Share quote
    const handleShare = async () => {
        if (!quote) return;

        const shareText = `"${quote.text}" — ${quote.author}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "InspireTag Quote",
                    text: shareText,
                    url: window.location.href,
                });
                toast.success("Shared successfully!");
            } catch (error) {
                if (error.name !== "AbortError") {
                    copyToClipboard(shareText);
                }
            }
        } else {
            copyToClipboard(shareText);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Quote copied to clipboard!", {
            icon: "📋",
        });
    };

    // Handle category change
    const handleCategoryChange = async (categoryId) => {
        setSelectedCategory(categoryId);
        await fetchQuote(categoryId);
    };

    // Get category display with icon
    const getCategoryDisplay = (categoryId) => {
        const cat = CATEGORIES.find(c => c.id === categoryId);
        if (!cat) return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
                <Sparkles size={14} />
                <span className="text-sm font-medium">{categoryId}</span>
            </div>
        );
        const Icon = cat.icon;
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${cat.color}`}>
                <Icon size={14} />
                <span className="text-sm font-medium">{cat.label}</span>
            </div>
        );
    };

    // Initial load
    useEffect(() => {
        fetchQuote("random");
    }, []);

    if (loading && !quote) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">
                <div className="text-center">
                    <RefreshCw size={48} className="animate-spin text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Loading your inspiration...</p>
                </div>
            </div>
        );
    }

    const currentCategory = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

    return (
        <div className="min-h-screen bg-[#F4F5F7] py-8">
            <div className="px-4 md:px-8 max-w-6xl mx-auto">
                {/* Category Badge */}
                <div className="flex justify-center mb-6">
                    {quote && getCategoryDisplay(quote.category)}
                </div>

                {/* Main Quote Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-12 mb-6 transition-all duration-300 hover:shadow-xl">
                    {/* Greeting */}
                    <div className="text-center mb-8 md:mb-10">
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                            {greeting}, {userName}!
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base">Here's your message for today...</p>
                    </div>

                    {/* Quote Section */}
                    <div className="bg-gray-50 rounded-xl p-6 md:p-8 border border-gray-200 mb-6 transition-all duration-300">
                        <div className="relative">
                            <Quote size={28} className="text-gray-300 absolute -top-3 -left-3 opacity-50 hidden sm:block" />
                            <p className="text-base md:text-xl text-gray-800 text-center leading-relaxed px-2 md:px-4">
                                "{quote?.text}"
                            </p>
                            <Quote size={28} className="text-gray-300 absolute -bottom-3 -right-3 opacity-50 rotate-180 hidden sm:block" />
                        </div>
                        <p className="text-xs md:text-sm text-gray-500 text-center mt-6 italic">
                            — {quote?.author}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={handleSaveToFavorites}
                            disabled={isSaving}
                            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${savedToFavorites
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-gray-900 text-white hover:bg-gray-800"
                                } disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
                        >
                            {savedToFavorites ? (
                                <>
                                    <BookmarkCheck size={18} />
                                    <span className="text-sm font-medium">Saved to Favorites</span>
                                </>
                            ) : (
                                <>
                                    <Heart size={18} />
                                    <span className="text-sm font-medium">Save to Favorites</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleShare}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full sm:w-auto"
                        >
                            <Share2 size={18} />
                            <span className="text-sm font-medium">Share Quote</span>
                        </button>

                        <Link
                            href="/shop"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full sm:w-auto"
                        >
                            <ShoppingBag size={18} />
                            <span className="text-sm font-medium">Get Another Keychain</span>
                        </Link>
                    </div>
                </div>

                {/* Category Selector Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-md">
                    <h2 className="text-center text-gray-800 text-xl font-semibold mb-6 flex items-center justify-center gap-2">
                        <Sparkles size={20} />
                        Choose Your Quote Category
                    </h2>

                    <div className="flex items-center gap-3 justify-center flex-wrap mb-6">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    disabled={loading}
                                    className={`cursor-pointer text-sm px-3 md:px-4 py-2 rounded-full flex items-center gap-1.5 transition-all duration-300 ${isSelected
                                            ? "bg-gray-800 text-white shadow-md scale-105"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <Icon size={14} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Refresh Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => fetchQuote()}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" />
                                    <span className="text-sm font-medium">Loading...</span>
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={18} />
                                    <span className="text-sm font-medium">Get New Quote</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Upgrade to Subscription Link */}
                    <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                        <Link
                            href="/subscription"
                            className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-all duration-200 group cursor-pointer"
                        >
                            <Sparkles size={16} />
                            <span className="font-medium">Subscribe for Weekly Quotes</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                        </Link>
                    </div>
                </div>

                {/* Daily Reminder */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <Clock size={12} />
                        New quote available every day. Check back tomorrow!
                    </p>
                </div>
            </div>
        </div>
    );
}