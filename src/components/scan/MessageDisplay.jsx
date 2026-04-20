"use client";

import {
    Heart,
    Sparkles,
    Star,
    Flame,
    Smile,
    Share2,
    Heart as SaveIcon,
    RefreshCw,
    X,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { FaCross, FaShare } from "react-icons/fa6";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";

const CATEGORY_META = {
    faith: {
        icon: FaCross,
        bg: "bg-[#f5efe6]",
        accent: "text-[#c8a45d]",
        circle: "bg-[#fbf6ee]",
        subtitle: "Preparing today’s verse...",
        footer: "Come back tomorrow for a new verse.",
    },
    love: {
        icon: Heart,
        bg: "bg-[#f8eef0]",
        accent: "text-[#d79aa5]",
        circle: "bg-[#fcf5f6]",
        subtitle: "Opening your message...",
        footer: "Come back tomorrow for a new quote.",
    },
    hope: {
        icon: Smile,
        bg: "bg-[#eef2ee]",
        accent: "text-[#9fb1a5]",
        circle: "bg-[#f7faf7]",
        subtitle: "Preparing a gentle message...",
        footer: "Come back tomorrow for a new message.",
    },
    success: {
        icon: Star,
        bg: "bg-[#f4eee7]",
        accent: "text-[#b79a72]",
        circle: "bg-[#fbf7f2]",
        subtitle: "Your message is ready...",
        footer: "Come back tomorrow for a new verse.",
    },
    motivation: {
        icon: Flame,
        bg: "bg-[#edf3f6]",
        accent: "text-[#8faebb]",
        circle: "bg-[#f6fafb]",
        subtitle: "Finding your next step...",
        footer: "Come back tomorrow for a new quote.",
    },
    personal: {
        icon: Heart,
        bg: "bg-[#f7f1eb]",
        accent: "text-[#c5a07b]",
        circle: "bg-[#fcf8f4]",
        subtitle: "Your personal message is ready...",
        footer: "Come back tomorrow for a new message.",
    },
};

export default function MessageDisplay({
    message,
    category,
    isPersonalMessage,
    isAlreadyScanned,
    quoteId,
    tagCode,
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isInitialized } = useAuthStore();

    const [saved, setSaved] = useState(false);
    const [favoriteId, setFavoriteId] = useState(null);
    const [saveLoading, setSaveLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const meta = useMemo(() => {
        if (isPersonalMessage) return CATEGORY_META.personal;
        return CATEGORY_META[category] || CATEGORY_META.faith;
    }, [category, isPersonalMessage]);

    const Icon = meta.icon;

    const subtitle = isAlreadyScanned
        ? "Your message is ready..."
        : meta.subtitle;

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: "InspireTag Message",
                    text: message,
                });
                return;
            }

            await navigator.clipboard.writeText(message || "");
            toast.success("Message copied for sharing");
        } catch (error) {
            console.error("Share failed:", error);
        }
    };

    const goToAuth = (type = "login") => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem(
                "pendingFavoriteMessage",
                JSON.stringify({
                    quoteId,
                    tagCode,
                    message,
                    category,
                    isPersonalMessage,
                    redirect: pathname,
                })
            );
        }

        const target = type === "register" ? "/signup" : "/login";
        router.push(`${target}?redirect=${encodeURIComponent(pathname)}`);
    };

    const checkFavoriteStatus = async () => {
        if (!user || !quoteId) return;

        try {
            const response = await api.get(`/favorites/check?quoteId=${quoteId}`);
            const data = response.data?.data;
            setSaved(!!data?.isFavorite);
            setFavoriteId(data?.favoriteId || null);
        } catch (error) {
            console.error("Check favorite failed:", error);
        }
    };

    const handleSave = async () => {
        if (!isInitialized) return;

        if (!user) {
            setShowAuthModal(true);
            return;
        }

        if (!quoteId) {
            toast.error("This message cannot be saved");
            return;
        }

        try {
            setSaveLoading(true);

            if (saved && favoriteId) {
                await api.delete(`/favorites/${favoriteId}`);
                setSaved(false);
                setFavoriteId(null);
                toast.success("Removed from favorites");
                return;
            }

            const response = await api.post("/favorites", { quoteId });
            const created = response.data?.data;

            setSaved(true);
            setFavoriteId(created?._id || null);
            toast.success("Saved to favorites");
        } catch (error) {
            console.error("Save favorite failed:", error);
            toast.error(error.response?.data?.message || "Failed to save");
        } finally {
            setSaveLoading(false);
        }
    };

    const handleAnother = () => {
        window.location.reload();
    };

    useEffect(() => {
        if (user && quoteId) {
            checkFavoriteStatus();
        }
    }, [user, quoteId]);

    return (
        <>
            <div className={`min-h-screen ${meta.bg} flex items-center justify-center px-4 py-6`}>
                <div className="w-full max-w-sm md:max-w-md">
                    <div className="rounded-[28px] px-5 py-6 md:px-7 md:py-8 text-center">
                        <h1 className="text-[34px] md:text-[38px] leading-none font-semibold text-[#8d7456] tracking-tight mb-8">
                            InspireTag
                        </h1>

                        <p className="text-[20px] md:text-[22px] text-[#7d725f] mb-6">
                            {subtitle}
                        </p>

                        <div
                            className={`w-20 h-20 md:w-24 md:h-24 ${meta.circle} rounded-full shadow-xl flex items-center justify-center mx-auto mb-7`}
                        >
                            <Icon className={meta.accent} size={34} strokeWidth={1.8} />
                        </div>

                        <div className="bg-white/80 shadow-xl rounded-[20px] px-6 py-8 md:px-8 md:py-10 mb-7 border border-white/70">
                            <p className="text-[25px] md:text-[31px] leading-[1.45] text-[#776a59] italic font-medium">
                                {message}
                            </p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center justify-between bg-white/80 border border-[#e9dfd2] rounded-full px-2 py-1 shadow-xl">
                                <button
                                    onClick={handleShare}
                                    className="flex-1 h-10 md:h-12 flex items-center justify-center gap-2 text-[#7e735f] text-sm md:text-base font-medium"
                                >
                                    <FaShare size={16} />
                                    <span>Share</span>
                                </button>

                                <div className="h-5 w-px bg-[#e5d8c7]" />

                                <button
                                    onClick={handleSave}
                                    disabled={saveLoading}
                                    className="flex-1 h-10 md:h-12 flex items-center justify-center gap-2 text-[#7e735f] text-sm md:text-base font-medium disabled:opacity-60"
                                >
                                    <SaveIcon size={16} className={saved ? "fill-current" : ""} />
                                    <span>
                                        {saveLoading ? "Saving..." : saved ? "Saved" : "Save"}
                                    </span>
                                </button>

                                <div className="h-5 w-px bg-[#e5d8c7]" />

                                <button
                                    onClick={handleAnother}
                                    className="flex-1 h-10 md:h-12 flex items-center justify-center gap-2 text-[#7e735f] text-sm md:text-base font-medium"
                                >
                                    <RefreshCw size={16} />
                                    <span>Another</span>
                                </button>
                            </div>
                        </div>

                        <p className="text-[17px] md:text-[19px] text-[#7f7466] mb-4">
                            {meta.footer}
                        </p>

                        <p className="text-xs md:text-sm text-[#988c7f]">
                            Powered by <span className="font-semibold">InspireTag</span>
                        </p>
                    </div>
                </div>
            </div>

            {showAuthModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            Save your message
                        </h3>

                        <p className="text-gray-600 mb-5">
                            Please log in or create an account to save this message to your favorites.
                        </p>

                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-6">
                            <p className="text-gray-700 italic text-center">
                                “{message}”
                            </p>
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