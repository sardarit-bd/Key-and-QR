"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Share2, Sparkles, BookOpen, X } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import favoriteService from "@/services/favorite-service/favorite.service";
import { useAuthStore } from "@/store/authStore";

const DEFAULT_IMAGES = {
    love: "/images/quote-bg/love.jpg",
    strength: "/images/quote-bg/strength.jpg",
    healing: "/images/quote-bg/healing.jpg",
    faith: "/images/quote-bg/faith.jpg",
    gratitude: "/images/quote-bg/gratitude.jpg",
    personal: "/images/quote-bg/peace.jpg",
};

const CATEGORY_LABELS = {
    love: "Love ♥",
    strength: "Strength ◐",
    healing: "Healing ✦",
    faith: "Faith ☾",
    gratitude: "Gratitude ☀",
    personal: "Personal ♥",
};

export default function PublicQuoteDisplay({ data, tagCode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isInitialized } = useAuthStore();

    const quoteText = data?.quote || "";
    const quoteAuthor = data?.author;
    const isPersonalMessage = !!data?.isPersonalMessage;
    const category = isPersonalMessage ? "personal" : data?.category || "faith";

    const backgroundImage =
        data?.image || DEFAULT_IMAGES[category] || DEFAULT_IMAGES.faith;

    const categoryLabel = CATEGORY_LABELS[category] || CATEGORY_LABELS.faith;

    const canFavorite = !isPersonalMessage;

    const [quoteId, setQuoteId] = useState(null);
    const [saved, setSaved] = useState(false);
    const [favoriteId, setFavoriteId] = useState(null);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);

    const resolveQuoteId = async () => {
        if (!tagCode) return null;
        try {
            const response = await api.get(`/tags/resolve/${tagCode}`);
            const resolvedQuote = response.data?.data?.quote;
            return resolvedQuote?._id || null;
        } catch (error) {
            console.error("Failed to resolve quote id:", error);
            return null;
        }
    };

    const checkFavoriteStatus = async () => {
        const id = quoteId || (await resolveQuoteId());
        if (!id) return;
        setQuoteId(id);
        try {
            const response = await favoriteService.checkFavorite(null, id);
            const result = response?.data;
            setSaved(!!result?.isFavorite);
            setFavoriteId(result?.favoriteId || null);
        } catch (error) {
            console.error("Check favorite failed:", error);
        }
    };

    useEffect(() => {
        if (isInitialized && user && canFavorite) {
            checkFavoriteStatus();
        }
    }, [isInitialized, user, tagCode, canFavorite]);

    const goToAuth = (type = "login") => {
        const target = type === "register" ? "/signup" : "/login";
        router.push(`${target}?redirect=${encodeURIComponent(pathname)}`);
    };

    const handleFavoriteClick = async () => {
        if (!canFavorite || !isInitialized || favoriteLoading) return;
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        try {
            setFavoriteLoading(true);
            const id = quoteId || (await resolveQuoteId());
            if (!id) {
                toast.error("This quote can't be saved right now");
                return;
            }
            setQuoteId(id);
            if (saved && favoriteId) {
                await favoriteService.removeFavorite(favoriteId);
                setSaved(false);
                setFavoriteId(null);
                toast.success("Removed from favorites");
                return;
            }
            const response = await favoriteService.addFavorite({ quoteId: id });
            setSaved(true);
            setFavoriteId(response?.data?._id || null);
            toast.success("Saved to favorites");
        } catch (error) {
            console.error("Favorite action failed:", error);
            toast.error(error.response?.data?.message || "Failed to save favorite");
        } finally {
            setFavoriteLoading(false);
        }
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        const shareText = `"${quoteText}"${quoteAuthor ? ` — ${quoteAuthor}` : ''}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: "InspireTag Quote", text: shareText, url: shareUrl });
            } catch (err) {
                // User cancelled share
            }
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
            toast.success("Quote copied to clipboard");
        }
        setShowShareMenu(false);
    };

    const handleReflect = () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        toast.success("Reflection feature coming soon!");
    };

    return (
        <>
            <main className="min-h-screen bg-black flex items-center justify-center">
                <section
                    className="relative w-full min-h-screen max-w-[430px] mx-auto overflow-hidden bg-black"
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    {/* Dark cinematic overlays */}
                    <div className="absolute inset-0 bg-black/45" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/70" />

                    {/* Category */}
                    <div className="relative z-10 pt-5 text-center">
                        <p className="text-[12px] tracking-wide text-[#f3d6a0] font-light">
                            {categoryLabel}
                        </p>
                    </div>

                    {/* Quote */}
                    <div className="relative z-10 px-6 sm:px-8 pt-16 text-center">
                        <h1 className="text-white text-[24px] sm:text-[28px] leading-[1.18] font-serif font-medium drop-shadow-xl">
                            {quoteText}
                        </h1>
                        {quoteAuthor && (
                            <p className="mt-5 text-[#e7b96f] text-[13px] font-serif">
                                - {quoteAuthor} -
                            </p>
                        )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent pt-12 pb-8">
                        <div className="flex items-center justify-center gap-6">
                            {/* Save / Heart */}
                            <button
                                onClick={handleFavoriteClick}
                                disabled={favoriteLoading || !canFavorite}
                                className="flex flex-col items-center gap-1 text-[#e6b76f] hover:text-white transition disabled:opacity-40"
                                aria-label={saved ? "Remove from favorites" : "Save quote"}
                            >
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center border transition ${
                                    saved ? 'bg-[#e6b76f]/20 border-[#e6b76f]' : 'border-white/20 hover:border-white/40'
                                }`}>
                                    <Heart size={20} className={saved ? "fill-current" : ""} />
                                </div>
                                <span className="text-[10px]">{saved ? 'Saved' : 'Save'}</span>
                            </button>

                            {/* Inspire / Refresh */}
                            <button
                                onClick={() => router.refresh()}
                                className="flex flex-col items-center gap-1 text-[#e6b76f] hover:text-white transition"
                                aria-label="Get new inspiration"
                            >
                                <div className="w-11 h-11 rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 transition">
                                    <Sparkles size={20} />
                                </div>
                                <span className="text-[10px]">Inspire</span>
                            </button>

                            {/* Share */}
                            <button
                                onClick={handleShare}
                                className="flex flex-col items-center gap-1 text-[#e6b76f] hover:text-white transition"
                                aria-label="Share quote"
                            >
                                <div className="w-11 h-11 rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 transition">
                                    <Share2 size={20} />
                                </div>
                                <span className="text-[10px]">Share</span>
                            </button>

                            {/* Reflect */}
                            <button
                                onClick={handleReflect}
                                className="flex flex-col items-center gap-1 text-[#e6b76f] hover:text-white transition"
                                aria-label="Write a reflection"
                            >
                                <div className="w-11 h-11 rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 transition">
                                    <BookOpen size={20} />
                                </div>
                                <span className="text-[10px]">Reflect</span>
                            </button>
                        </div>

                        <p className="mt-4 text-center text-[11px] text-[#e6b76f]/60 tracking-wide">
                            myinspiretag.com
                        </p>
                    </div>
                </section>
            </main>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            Save your quote
                        </h3>
                        <p className="text-gray-600 mb-5">
                            Please log in or create an account to save this quote to your favorites.
                        </p>
                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-6">
                            <p className="text-gray-700 italic text-center">&ldquo;{quoteText}&rdquo;</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => goToAuth("login")}
                                className="h-11 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => goToAuth("register")}
                                className="h-11 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
