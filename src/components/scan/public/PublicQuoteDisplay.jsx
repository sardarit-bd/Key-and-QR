"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Share2, Sparkles, BookOpen, X, Gift, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import favoriteService from "@/services/favorite-service/favorite.service";
import premiumService from "@/services/premium-service/premium.service";
import orderService from "@/services/order.service";
import { useAuthStore } from "@/store/authStore";
import {
  getPrettyCategoryLabel,
  resolveBackgroundImage,
} from "@/components/category";

import VisualQuoteRenderer from "@/components/quote/VisualQuoteRenderer";
import VisualQuoteAudioPlayer from "@/components/quote/VisualQuoteAudioPlayer";
import useShareQuote from "@/hooks/useShareQuote";
import ShareQuoteModal from "@/components/quote/ShareQuoteModal";

export default function PublicQuoteDisplay({ data, tagCode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized } = useAuthStore();

  const quoteText = data?.quote || data?.text || "";
  const quoteAuthor = data?.author;
  const isPersonalMessage = !!data?.isPersonalMessage;
  const category = isPersonalMessage ? "personal" : data?.category || "faith";

  const renderedImageUrl =
    data?.renderedImages?.mobile?.url ||
    data?.renderedImages?.desktop?.url ||
    null;

  const audioTrack =
    data?.editorData?.mobile?.elements?.find((e) => e.type === 'audio' && e.audioData?.source)?.audioData ||
    data?.editorData?.desktop?.elements?.find((e) => e.type === 'audio' && e.audioData?.source)?.audioData ||
    data?.editorData?.mobile?.audio ||
    data?.editorData?.desktop?.audio ||
    null;

  const hasVisualDesign =
    !isPersonalMessage &&
    Boolean(
      renderedImageUrl ||
      (data?.editorData &&
        ((data.editorData.mobile?.elements && data.editorData.mobile.elements.length > 0) ||
          (data.editorData.desktop?.elements && data.editorData.desktop.elements.length > 0) ||
          (data.editorData.elements && data.editorData.elements.length > 0)))
    );

  const backgroundImage =
    data?.image || resolveBackgroundImage(category);

  const categoryLabel = getPrettyCategoryLabel(category);

  const canFavorite = !isPersonalMessage;

  const [saved, setSaved] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

  const isGiftClaimable = (data?.isClaimable || data?.gift?.isClaimable) && !isClaimed;
  const giftOrderId = data?.giftOrderId || data?.gift?.orderId;

  const handleClaimGift = async () => {
    if (!user) {
      goToAuth("login");
      return;
    }

    if (!giftOrderId) {
      toast.error("Unable to identify gift order");
      return;
    }

    setIsClaiming(true);
    try {
      const res = await orderService.claimGift(giftOrderId);
      if (res?.success) {
        toast.success("🎉 Gift claimed successfully! This MyInspireTag is now yours.");
        setIsClaimed(true);
      } else {
        toast.error(res?.message || "Failed to claim gift");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to claim gift";
      toast.error(errorMsg);
    } finally {
      setIsClaiming(false);
    }
  };

  const checkFavoriteStatus = async () => {
    const id = data?._id;
    if (!id) return;
    try {
      const response = await favoriteService.checkFavorite({ quoteId: id });
      const result = response?.data;
      setSaved(!!result?.exists);
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

    const id = data?._id;
    if (!id) {
      toast.error("This quote can't be saved right now");
      return;
    }

    // Removing an existing favorite does not require Premium
    if (saved && favoriteId) {
      try {
        setFavoriteLoading(true);
        await favoriteService.removeFavorite(favoriteId);
        setSaved(false);
        setFavoriteId(null);
        toast.success("Removed from favorites");
      } catch (error) {
        console.error("Favorite action failed:", error);
        toast.error(error.response?.data?.message || "Failed to remove favorite");
      } finally {
        setFavoriteLoading(false);
      }
      return;
    }

    // Adding a quote favorite requires Premium (subscriber-only save, P0.5)
    try {
      setFavoriteLoading(true);
      const premium = await premiumService.hasActiveSubscription();
      if (!premium?.data?.hasActive) {
        setShowUpgradeModal(true);
        return;
      }
      const response = await favoriteService.addFavorite({ quoteId: id });
      setSaved(true);
      setFavoriteId(response?.data?._id || null);
      toast.success("Saved to favorites");
    } catch (error) {
      console.error("Favorite action failed:", error);
      const code = error.response?.data?.code;
      if (code === "UPGRADE_REQUIRED") {
        setShowUpgradeModal(true);
      } else {
        toast.error(error.response?.data?.message || "Failed to save favorite");
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  const { isShareOpen, shareData, closeShare, shareQuote } = useShareQuote();

  const handleShare = () => {
    shareQuote({
      type: "tag",
      tagCode,
      quoteId: data?._id,
      text: quoteText,
      author: quoteAuthor,
      category,
      imageUrl: renderedImageUrl || (typeof backgroundImage === "string" ? backgroundImage : null),
    });
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
          className="relative w-full min-h-screen max-w-[430px] mx-auto overflow-hidden bg-black flex flex-col justify-between"
          style={
            hasVisualDesign
              ? undefined
              : {
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
          }
        >
          {/* Legacy Dark cinematic overlays (only for legacy non-canvas quotes) */}
          {!hasVisualDesign && (
            <>
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/70" />
            </>
          )}

          {/* Top Bar: Category Label & Audio Control */}
          <div className="relative z-20 pt-5 px-6 flex items-center justify-between shrink-0">
            <div className="w-11" />
            <p className="text-[12px] tracking-wide text-[#f3d6a0] font-light drop-shadow-md">
              {categoryLabel}
            </p>
            <div className="w-11 flex justify-end">
              {audioTrack?.source && (
                <VisualQuoteAudioPlayer track={audioTrack} compact />
              )}
            </div>
          </div>

          {/* Main Visual Quote Area */}
          {hasVisualDesign ? (
            <div className="relative z-10 flex-1 w-full flex items-center justify-center p-2 my-auto min-h-[460px]">
              {data?.editorData ? (
                <VisualQuoteRenderer
                  editorData={data.editorData}
                  mode="auto"
                  showAudioPlayer={false}
                  className="w-full h-full"
                />
              ) : renderedImageUrl ? (
                <div className="relative w-full h-full flex items-center justify-center min-h-[460px] overflow-hidden">
                  <img
                    src={renderedImageUrl}
                    alt={quoteText || "Visual Quote"}
                    className="w-full h-full max-h-[70vh] object-contain rounded-2xl shadow-2xl transition-all duration-300"
                  />
                </div>
              ) : null}
            </div>
          ) : (
            /* Legacy Non-Canvas Quote Text & Author */
            <div className="relative z-10 px-6 sm:px-8 pt-16 text-center my-auto">
              <h1 className="text-white text-[24px] sm:text-[28px] leading-[1.18] font-medium drop-shadow-xl">
                {quoteText}
              </h1>
              {quoteAuthor && (
                <p className="mt-5 text-[#e7b96f] text-[13px] ">
                  - {quoteAuthor} -
                </p>
              )}
            </div>
          )}

          {/* Gift Claim Banner */}
          {isGiftClaimable && (
            <div className="relative z-30 mx-4 mb-2 rounded-2xl border border-amber-400/40 bg-black/80 backdrop-blur-xl p-3.5 shadow-2xl animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Gift className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-semibold text-white tracking-tight leading-snug">
                    Gifted MyInspireTag
                  </h4>
                  <p className="text-[11px] text-white/70 truncate">
                    {user ? "Add this tag to your account" : "Sign in to claim this tag"}
                  </p>
                </div>
                <button
                  onClick={handleClaimGift}
                  disabled={isClaiming}
                  className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black px-3.5 py-2 text-xs font-bold shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {isClaiming ? "Claiming..." : user ? "Claim Gift" : "Sign In"}
                </button>
              </div>
            </div>
          )}

          {/* Gift Claimed / Registered Status */}
          {isGift && (isClaimed || data?.gift?.giftStatus === "claimed") && !isGiftClaimable && (
            <div className="relative z-30 mx-4 mb-2 rounded-2xl border border-emerald-400/30 bg-emerald-950/70 backdrop-blur-xl px-3.5 py-2.5 shadow-xl flex items-center justify-center gap-2 animate-in fade-in duration-300">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-xs font-medium text-emerald-200">
                {isClaimed ? "This MyInspireTag is now registered to your account!" : "Gift Claimed · MyInspireTag"}
              </p>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="relative z-20 bg-gradient-to-t from-black/85 via-black/50 to-transparent pt-10 pb-8 shrink-0">
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

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Premium required to save quotes
            </h3>
            <p className="text-gray-600 mb-5">
              Free accounts can't save quotes to favorites. Upgrade to Premium for unlimited saves.
            </p>
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-6">
              <p className="text-gray-700 italic text-center">&ldquo;{quoteText}&rdquo;</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/new-dashboard/user/premium")}
                className="h-11 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
              >
                Upgrade Now
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="h-11 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Share Quote Modal */}
      <ShareQuoteModal
        isOpen={isShareOpen}
        onClose={closeShare}
        quoteData={shareData}
      />
    </>
  );
}
