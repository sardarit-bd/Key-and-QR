"use client";

import { Heart, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";

const DEFAULT_IMAGES = {
  faith: "/images/quote-bg/faith.jpg",
  love: "/images/quote-bg/love.jpg",
  hope: "/images/quote-bg/healing.jpg",
  success: "/images/quote-bg/success.jpg",
  motivation: "/images/quote-bg/strength.jpg",
  personal: "/images/quote-bg/peace.jpg",
};

const CATEGORY_LABELS = {
  faith: "Faith ☾",
  love: "Love ♥",
  hope: "Healing ✦",
  success: "Success ☆",
  motivation: "Strength ◐",
  personal: "Personal ♥",
};

export default function MessageDisplay({
  message,
  category = "faith",
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

  const quoteData = useMemo(() => {
    if (typeof message === "object" && message !== null) {
      return message;
    }

    return {
      text: message,
      author: "InspireTag",
      category,
      image: null,
    };
  }, [message, category]);

  const quoteText = quoteData?.text || quoteData?.quote || message || "";
  const quoteAuthor = quoteData?.author || "InspireTag";
  const finalCategory = isPersonalMessage ? "personal" : quoteData?.category || category || "faith";

  const backgroundImage =
    quoteData?.image?.url ||
    quoteData?.image ||
    DEFAULT_IMAGES[finalCategory] ||
    DEFAULT_IMAGES.faith;

  const categoryLabel = CATEGORY_LABELS[finalCategory] || CATEGORY_LABELS.faith;

  const finalQuoteId = quoteData?._id || quoteId;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "InspireTag",
          text: quoteText,
        });
        return;
      }

      await navigator.clipboard.writeText(quoteText || "");
      toast.success("Quote copied");
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const goToAuth = (type = "login") => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "pendingFavoriteMessage",
        JSON.stringify({
          quoteId: finalQuoteId,
          tagCode,
          message: quoteText,
          category: finalCategory,
          isPersonalMessage,
          redirect: pathname,
        })
      );
    }

    const target = type === "register" ? "/signup" : "/login";
    router.push(`${target}?redirect=${encodeURIComponent(pathname)}`);
  };

  const checkFavoriteStatus = async () => {
    if (!user || !finalQuoteId) return;

    try {
      const response = await api.get(`/favorites/check?quoteId=${finalQuoteId}`);
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

    if (!finalQuoteId) {
      toast.error("This quote cannot be saved");
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

      const response = await api.post("/favorites", { quoteId: finalQuoteId });
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

  useEffect(() => {
    if (user && finalQuoteId) {
      checkFavoriteStatus();
    }
  }, [user, finalQuoteId]);

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
          <div className="relative z-10 px-8 pt-16 text-center">
            <h1 className="text-white text-[28px] leading-[1.18] font-serif font-medium drop-shadow-xl">
              {quoteText}
            </h1>

            {quoteAuthor && (
              <p className="mt-5 text-[#e7b96f] text-[13px] font-serif">
                - {quoteAuthor} -
              </p>
            )}

            {isAlreadyScanned && (
              <p className="mt-4 text-white/70 text-xs">
                You already unlocked this message today
              </p>
            )}
          </div>

          {/* Bottom actions */}
          <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center">
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#e6b76f] hover:bg-white/10 transition disabled:opacity-60"
              aria-label="Save quote"
            >
              <Heart
                size={20}
                strokeWidth={1.5}
                className={saved ? "fill-current" : ""}
              />
            </button>

            <button
              onClick={handleShare}
              className="mt-1 text-[11px] text-[#e6b76f] tracking-wide"
            >
              myinspiretag.com
            </button>
          </div>
        </section>
      </main>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Save your quote
            </h3>

            <p className="text-gray-600 mb-5">
              Please log in or create an account to save this quote.
            </p>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-6">
              <p className="text-gray-700 italic text-center">“{quoteText}”</p>
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