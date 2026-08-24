"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, Sparkles, BookOpen, X, Gift, Check, Music } from "lucide-react";
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
    data?.editorData?.audio ||
    null;

  const hasAutoplayAudio = Boolean(audioTrack?.source && (audioTrack?.autoplay ?? true));

  // If there is NO audio or autoplay is false, default to revealed
  const [isRevealed, setIsRevealed] = useState(!hasAutoplayAudio);
  const audioPlayerRef = useRef(null);

  const handleReveal = async () => {
    if (audioPlayerRef.current) {
      await audioPlayerRef.current.play();
    }
    setIsRevealed(true);
  };

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

  const isGift = Boolean(data?.isGift || data?.gift || data?.giftOrderId || data?.giftStatus || data?.gift?.giftStatus);
  const isGiftClaimable = (data?.isClaimable || data?.gift?.isClaimable) && !isClaimed;
  const giftOrderId = data?.giftOrderId || data?.gift?.orderId;

  const handleClaimGift = async () => {
    if (!user) {
      setShowAuthModal(true);
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

  const goToAuth = (type = "register") => {
    if (typeof window !== "undefined" && data) {
      try {
        const quoteToPreserve = {
          _id: data?._id || null,
          quote: quoteText || data?.quote || data?.text || "",
          text: quoteText || data?.quote || data?.text || "",
          author: quoteAuthor || data?.author || "",
          category: category || data?.category || "faith",
          isPersonalMessage: !!isPersonalMessage,
          renderedImages: data?.renderedImages || null,
          editorData: data?.editorData || null,
          image: typeof backgroundImage === "string" ? backgroundImage : (data?.image || null),
          audioTrack: audioTrack || null,
          tagCode: tagCode || null,
          timestamp: Date.now(),
        };
        localStorage.setItem("pending_dashboard_quote", JSON.stringify(quoteToPreserve));
      } catch (err) {
        console.error("Failed to save pending quote:", err);
      }
    }

    const target = type === "register" ? "/signup" : "/login";
    router.push(`${target}?redirect=${encodeURIComponent("/new-dashboard/user")}`);
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
      <main className="h-[calc(100dvh-64px)] lg:h-[100dvh] w-full bg-black flex items-center justify-center overflow-hidden">
        <section
          className="relative w-full h-[calc(100dvh-64px)] lg:h-[100dvh] max-w-[430px] mx-auto overflow-hidden bg-black flex flex-col justify-between"
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

          {/* Full-screen Interaction Overlay Fallback for Autoplay Audio on Mobile */}
          <AnimatePresence>
            {!isRevealed && (
              <motion.div
                key="reveal-overlay"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 z-40 h-full w-full flex flex-col justify-between items-center px-4 py-3 sm:py-4 bg-black/90 backdrop-blur-2xl text-center select-none overflow-hidden"
                style={
                  backgroundImage
                    ? {
                      backgroundImage: `radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.95) 100%), url(${backgroundImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                    : undefined
                }
              >
                {/* Ambient glow */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
                </div>

                {/* Top: Category Pill */}
                <div className="relative z-10 pt-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 text-[10.5px] font-semibold uppercase tracking-widest text-[#f3d6a0] shadow-sm">
                    <Sparkles size={10} className="text-amber-400 fill-current" />
                    <span>{categoryLabel}</span>
                  </div>
                </div>

                {/* Center: Hero Teaser & Reveal Button */}
                <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center my-auto px-4 max-w-[340px]">
                  {/* Glowing Aura Icon */}
                  <div className="relative mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-xl animate-pulse" />
                    <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-amber-400/40 bg-black/70 shadow-[0_0_25px_rgba(245,158,11,0.35)]">
                      <Sparkles size={20} className="text-amber-300 fill-amber-300/30" />
                    </div>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-light tracking-tight text-white drop-shadow-md mb-1">
                    Your Inspiration Awaits
                  </h2>
                  <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-4 max-w-[270px]">
                    A personalized message and soundtrack have been prepared for you.
                  </p>

                  {/* The Primary Interaction Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleReveal}
                    className="cursor-pointer group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-black shadow-[0_0_30px_rgba(245,158,11,0.45)] hover:shadow-[0_0_40px_rgba(245,158,11,0.65)] hover:brightness-105 transition-all duration-200"
                  >
                    <Sparkles size={14} className="fill-current text-black" />
                    <span className="tracking-wide font-bold">Reveal Your Inspiration</span>
                    <Music size={14} className="text-black/80" />
                  </motion.button>

                  <div className="mt-2.5 inline-flex items-center gap-1.5 text-[10.5px] text-white/50 font-medium">
                    <Music size={10} className="text-amber-400/80" />
                    <span>Includes audio experience</span>
                  </div>
                </div>

                {/* Bottom branding */}
                <div className="relative z-10 pb-0.5">
                  <p className="text-[10px] text-[#e6b76f]/60 tracking-wide font-light">
                    myinspiretag.com
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Visual Quote Area */}
          {hasVisualDesign ? (
            <div className="relative z-10 flex-1 w-full min-h-0 flex items-center justify-center p-2 my-auto overflow-hidden">
              {/* Subtle top-right overlay: Category above, Play button underneath */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20 pointer-events-auto">
                {categoryLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-3 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#f3d6a0] shadow-sm">
                    <Sparkles size={11} className="text-amber-400 fill-current" />
                    <span>{categoryLabel}</span>
                  </span>
                )}

                {audioTrack?.source && (
                  <VisualQuoteAudioPlayer
                    ref={audioPlayerRef}
                    track={audioTrack}
                    disableAutoplay={!isRevealed}
                    compact
                  />
                )}
              </div>

              {data?.editorData ? (
                <VisualQuoteRenderer
                  editorData={data.editorData}
                  mode="auto"
                  showAudioPlayer={false}
                  className="w-full h-full"
                />
              ) : renderedImageUrl ? (
                <div className="relative w-full h-full max-h-[52vh] sm:max-h-[55vh] flex items-center justify-center overflow-hidden">
                  <img
                    src={renderedImageUrl}
                    alt={quoteText || "Visual Quote"}
                    className="w-full h-full max-h-[52vh] sm:max-h-[55vh] object-contain rounded-2xl shadow-2xl transition-all duration-300"
                  />
                </div>
              ) : null}
            </div>
          ) : (
            /* Legacy Non-Canvas Quote Text & Author */
            <div className="relative z-10 flex-1 min-h-0 px-6 text-center my-auto flex flex-col justify-center items-center">
              {/* Subtle top-right overlay: Category above, Play button underneath */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20 pointer-events-auto">
                {categoryLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-3 py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#f3d6a0] shadow-sm">
                    <Sparkles size={11} className="text-amber-400 fill-current" />
                    <span>{categoryLabel}</span>
                  </span>
                )}

                {audioTrack?.source && (
                  <VisualQuoteAudioPlayer
                    ref={audioPlayerRef}
                    track={audioTrack}
                    disableAutoplay={!isRevealed}
                    compact
                  />
                )}
              </div>

              <h1 className="text-white text-[20px] sm:text-[24px] leading-[1.25] font-medium drop-shadow-xl max-w-[340px]">
                {quoteText}
              </h1>
              {quoteAuthor && (
                <p className="mt-3 text-[#e7b96f] text-[12.5px]">
                  - {quoteAuthor} -
                </p>
              )}
            </div>
          )}

          {/* Gift Claim Banner */}
          {isGiftClaimable && (
            <div className="relative z-30 mx-4 my-1 rounded-2xl border border-amber-400/40 bg-black/85 backdrop-blur-xl p-2.5 shadow-2xl animate-in fade-in duration-300 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Gift className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11.5px] font-semibold text-white tracking-tight leading-snug">
                    Gifted MyInspireTag
                  </h4>
                  <p className="text-[10px] text-white/70 truncate">
                    {user ? "Add this tag to your account" : "Sign in to claim this tag"}
                  </p>
                </div>
                <button
                  onClick={handleClaimGift}
                  disabled={isClaiming}
                  className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black px-2.5 py-1 text-[10.5px] font-bold shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {isClaiming ? "Claiming..." : user ? "Claim Gift" : "Sign In"}
                </button>
              </div>
            </div>
          )}

          {/* Gift Claimed / Registered Status */}
          {isGift && (isClaimed || data?.gift?.giftStatus === "claimed") && !isGiftClaimable && (
            <div className="relative z-30 mx-4 my-1 rounded-xl border border-emerald-400/30 bg-emerald-950/70 backdrop-blur-xl px-3 py-1.5 shadow-xl flex items-center justify-center gap-2 animate-in fade-in duration-300 shrink-0">
              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <p className="text-[10.5px] font-medium text-emerald-200">
                {isClaimed ? "This MyInspireTag is now registered to your account!" : "Gift Claimed · MyInspireTag"}
              </p>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="relative z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-2 pb-2.5 px-4 shrink-0">
            <div className="flex items-center justify-center gap-5 sm:gap-6">
              {/* Save / Heart */}
              <button
                onClick={handleFavoriteClick}
                disabled={favoriteLoading || !canFavorite}
                className="flex flex-col items-center gap-1 text-[#e6b76f] hover:text-white transition disabled:opacity-40 cursor-pointer"
                aria-label={saved ? "Remove from favorites" : "Save quote"}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition ${
                    saved
                      ? "bg-[#e6b76f]/20 border-[#e6b76f]"
                      : "border-white/20 hover:border-white/40"
                  }`}
                >
                  <Heart size={16} className={saved ? "fill-current" : ""} />
                </div>
                <span className="text-[9.5px]">{saved ? "Saved" : "Save"}</span>
              </button>

              {/* Inspire / Refresh */}
              <button
                onClick={() => router.refresh()}
                className="flex flex-col items-center gap-1 text-[#e6b76f] hover:text-white transition cursor-pointer"
                aria-label="Get new inspiration"
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 transition">
                  <Sparkles size={16} />
                </div>
                <span className="text-[9.5px]">Inspire</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex flex-col items-center gap-1 text-[#e6b76f] hover:text-white transition cursor-pointer"
                aria-label="Share quote"
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 transition">
                  <Share2 size={16} />
                </div>
                <span className="text-[9.5px]">Share</span>
              </button>

              {/* Reflect */}
              <button
                onClick={handleReflect}
                className="flex flex-col items-center gap-1 text-[#e6b76f] hover:text-white transition cursor-pointer"
                aria-label="Write a reflection"
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 transition">
                  <BookOpen size={16} />
                </div>
                <span className="text-[9.5px]">Reflect</span>
              </button>
            </div>

            <p className="mt-1.5 text-center text-[10px] text-[#e6b76f]/60 tracking-wide font-light">
              myinspiretag.com
            </p>
          </div>
        </section>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
                <Sparkles size={20} className="text-amber-500" />
              </div>
            </div>

            <h3 className="text-[17px] font-semibold text-gray-900 text-center mb-1">
              Create an account to save this
            </h3>
            <p className="text-[13px] text-gray-500 text-center mb-4 leading-relaxed">
              Save quotes to your collection, track your inspiration history, and more — for free.
            </p>

            {/* Quote Preview */}
            {quoteText && (
              <div className="rounded-xl bg-amber-50/60 border border-amber-200/60 px-4 py-3 mb-5">
                <p className="text-[13px] text-gray-600 italic text-center line-clamp-2">&ldquo;{quoteText}&rdquo;</p>
              </div>
            )}

            {/* Primary CTA: Sign Up */}
            <button
              onClick={() => goToAuth("register")}
              className="w-full h-11 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all duration-150 cursor-pointer"
            >
              Create Account — It&apos;s Free
            </button>

            {/* Secondary: Log In */}
            <p className="mt-3 text-center text-[13px] text-gray-500">
              Already have an account?{" "}
              <button
                onClick={() => goToAuth("login")}
                className="font-medium text-gray-800 underline underline-offset-2 hover:text-gray-600 transition-colors cursor-pointer"
              >
                Log in
              </button>
            </p>
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
