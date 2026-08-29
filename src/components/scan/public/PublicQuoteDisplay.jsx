"use client";

import { useEffect, useState, useRef, useMemo } from "react";
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
} from "@/components/public/quote/category";

import VisualQuoteRenderer from "@/components/public/quote/VisualQuoteRenderer";
import VisualQuoteAudioPlayer from "@/components/public/quote/VisualQuoteAudioPlayer";
import useShareQuote from "@/hooks/useShareQuote";
import ShareQuoteModal from "@/components/public/quote/ShareQuoteModal";

export default function PublicQuoteDisplay({ data, tagCode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized } = useAuthStore();

  const quoteText = data?.quote || data?.text || "";
  const quoteAuthor = data?.author;
  const isPersonalMessage = !!data?.isPersonalMessage;
  const category = isPersonalMessage ? "personal" : data?.category || "faith";

  const audioTrack = useMemo(() => {
    const rawAudio =
      data?.audioTrack ||
      data?.backgroundMusic ||
      data?.editorData?.mobile?.elements?.find((e) => e.type === 'audio' && e.audioData?.source)?.audioData ||
      data?.editorData?.desktop?.elements?.find((e) => e.type === 'audio' && e.audioData?.source)?.audioData ||
      data?.editorData?.elements?.find((e) => e.type === 'audio' && e.audioData?.source)?.audioData ||
      data?.editorData?.mobile?.audio ||
      data?.editorData?.desktop?.audio ||
      data?.editorData?.audio ||
      data?.audio ||
      data?.audioUrl ||
      null;

    if (!rawAudio) return null;
    if (typeof rawAudio === 'string') {
      return { source: rawAudio, autoplay: true, loop: true };
    }
    if (rawAudio?.source) {
      return rawAudio;
    }
    if (rawAudio?.url) {
      return { ...rawAudio, source: rawAudio.url };
    }
    return null;
  }, [data]);

  // Default to false so every scan presents the signature teaser experience.
  // The user interaction unlocks audio playback across mobile and desktop browsers.
  const [isRevealed, setIsRevealed] = useState(false);
  const audioPlayerRef = useRef(null);

  const handleReveal = async () => {
    if (audioPlayerRef.current) {
      await audioPlayerRef.current.play();
    }
    setIsRevealed(true);
  };

  const editorData = data?.editorData || data?.quote?.editorData;
  const hasFabricCanvas = Boolean(
    editorData &&
      ((editorData.mobile?.elements && editorData.mobile.elements.length > 0) ||
        (editorData.desktop?.elements && editorData.desktop.elements.length > 0) ||
        (editorData.elements && editorData.elements.length > 0))
  );

  const renderedDesktopUrl =
    data?.renderedImages?.desktop?.url ||
    data?.quote?.renderedImages?.desktop?.url ||
    null;

  const renderedMobileUrl =
    data?.renderedImages?.mobile?.url ||
    data?.quote?.renderedImages?.mobile?.url ||
    null;

  const hasRenderedImage = Boolean(renderedDesktopUrl || renderedMobileUrl);

  // Comprehensive image resolution
  const resolvedBgUrl = useMemo(() => {
    const rawImage =
      renderedMobileUrl ||
      renderedDesktopUrl ||
      (data?.renderedImage && typeof data.renderedImage === "string" ? data.renderedImage : data?.renderedImage?.url) ||
      data?.imageUrl ||
      data?.image ||
      data?.editorData?.background?.url ||
      resolveBackgroundImage(category) ||
      null;

    if (!rawImage) return null;
    if (typeof rawImage === "string") return rawImage;
    return rawImage?.src || null;
  }, [data, category, renderedMobileUrl, renderedDesktopUrl]);

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
          image: resolvedBgUrl || null,
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
    router.push(`${target}?redirect=${encodeURIComponent(`/t/${tagCode || ""}`)}`);
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
      imageUrl: resolvedBgUrl,
    });
  };

  const handleReflect = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    toast.success("Reflection journal coming soon!");
  };

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] overflow-hidden bg-black select-none z-10 text-white flex flex-col justify-between">
      {/* 100% Full-Screen Edge-to-Edge Background Artwork */}
      {resolvedBgUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedBgUrl}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover object-center -z-20 pointer-events-none"
        />
      )}

      {/* Full-Screen Dark Vignette Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/80 -z-10 pointer-events-none" />

      {/* Full-Screen Interaction Overlay for Autoplay Audio on Mobile */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div
            key="reveal-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-50 h-full w-full flex flex-col justify-between items-center px-4 py-6 bg-black/90 backdrop-blur-2xl text-center select-none overflow-hidden"
            style={
              resolvedBgUrl
                ? {
                  backgroundImage: `radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.95) 100%), url(${resolvedBgUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
                : undefined
            }
          >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
            </div>

            {/* Top: Category Pill */}
            <div className="relative z-10 pt-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-neutral-950/45 backdrop-blur-xl saturate-150 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#f3d6a0] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_24px_rgba(0,0,0,0.5)]">
                <Sparkles size={11} className="text-amber-400 fill-current" />
                <span>{categoryLabel}</span>
              </div>
            </div>

            {/* Center: Hero Teaser & Reveal Button */}
            <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center my-auto px-4 max-w-sm">
              {/* Glowing Aura Icon */}
              <div className="relative mb-5 flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl animate-pulse" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/40 bg-neutral-950/80 backdrop-blur-md shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                  <Sparkles size={22} className="text-amber-300 fill-amber-300/30" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white drop-shadow-md mb-2">
                Your Inspiration Awaits
              </h2>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-6 max-w-[280px]">
                A personalized quote and soundtrack have been prepared for you.
              </p>

              {/* Primary Reveal Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleReveal}
                className="cursor-pointer group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-7 py-3 text-xs sm:text-sm font-bold text-black shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:shadow-[0_0_45px_rgba(245,158,11,0.7)] hover:brightness-105 transition-all duration-200"
              >
                <Sparkles size={15} className="fill-current text-black" />
                <span className="tracking-wide font-bold">Reveal Your Inspiration</span>
                <Music size={15} className="text-black/80" />
              </motion.button>

              <div className="mt-3.5 inline-flex items-center gap-1.5 text-[11px] text-white/50 font-medium">
                <Music size={11} className="text-amber-400/80" />
                <span>Includes audio experience</span>
              </div>
            </div>

            {/* Bottom branding */}
            <div className="relative z-10 pb-2">
              <p className="text-[11px] text-[#e6b76f]/70 tracking-widest uppercase font-light">
                myinspiretag.com
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar: Centered Brand Mark, Category Pill, & Audio Control */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 sm:px-6 pt-3 sm:pt-4 pointer-events-auto">
        {/* Left: Audio Control (or balanced spacer) */}
        <div className="flex items-center justify-start min-w-[70px] sm:min-w-[90px]">
          {audioTrack?.source ? (
            <VisualQuoteAudioPlayer
              ref={audioPlayerRef}
              track={audioTrack}
              disableAutoplay={!isRevealed}
              compact
            />
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* Center: MyInspireTag Brand & Category */}
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="font-serif italic text-white/95 text-xs sm:text-sm tracking-widest font-semibold drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] uppercase">
            MyInspireTag
          </span>
          {categoryLabel && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-neutral-950/60 backdrop-blur-xl saturate-150 px-3 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#f3d6a0] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_16px_rgba(0,0,0,0.6)]">
              <Sparkles size={10} className="text-amber-400 fill-current" />
              <span>{categoryLabel}</span>
            </div>
          )}
        </div>

        {/* Right: Tag Code Badge (or balanced spacer) */}
        <div className="flex items-center justify-end min-w-[70px] sm:min-w-[90px]">
          {tagCode ? (
            <span className="text-[10px] text-white/70 font-mono tracking-wider bg-black/40 backdrop-blur-md border border-white/15 px-2 py-0.5 rounded-full">
              {tagCode.slice(-8)}
            </span>
          ) : (
            <div className="w-8" />
          )}
        </div>
      </header>

      {/* Center Typography / Quote Content */}
      <main className="relative z-10 flex-1 w-full h-full flex flex-col justify-center items-center text-center px-4 sm:px-8 pt-20 pb-36 sm:pt-24 sm:pb-40 my-auto pointer-events-none">
        {hasFabricCanvas ? (
          <div className="w-full h-full flex items-center justify-center pointer-events-auto p-2 sm:p-4">
            <VisualQuoteRenderer
              editorData={editorData}
              mode="auto"
              showAudioPlayer={false}
              fit="contain"
              className="w-full h-full max-h-[75vh] sm:max-h-[82vh]"
            />
          </div>
        ) : hasRenderedImage ? (
          <div className="w-full h-full flex items-center justify-center pointer-events-auto p-2 sm:p-4">
            <picture className="w-full h-full flex items-center justify-center">
              {renderedMobileUrl && (
                <source media="(max-width: 639px)" srcSet={renderedMobileUrl} />
              )}
              {renderedDesktopUrl && (
                <source media="(min-width: 640px)" srcSet={renderedDesktopUrl} />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={renderedMobileUrl || renderedDesktopUrl}
                alt={quoteText || "Daily Inspiration"}
                className="w-full h-full max-h-[75vh] sm:max-h-[82vh] object-contain rounded-2xl shadow-2xl"
              />
            </picture>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center max-w-xl mx-auto w-full px-5 py-6 sm:px-8 sm:py-8 rounded-3xl bg-neutral-950/25 backdrop-blur-xs border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] pointer-events-auto">
            {/* Elegant Golden Heart Separator */}
            <div className="mb-3.5 sm:mb-5 flex items-center justify-center opacity-90">
              <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-amber-400/80" />
              <Heart size={14} className="mx-2 text-amber-400 fill-amber-400/50 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-amber-400/80" />
            </div>

            {/* Quote Body Text */}
            {quoteText && (
              <h1 className="text-white text-[20px] sm:text-[25px] md:text-[30px] leading-[1.35] sm:leading-[1.4] font-serif font-normal drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] tracking-tight sm:tracking-normal max-w-lg">
                &ldquo;{quoteText}&rdquo;
              </h1>
            )}

            {/* Author Credit — Anchored directly below quote */}
            {quoteAuthor && (
              <div className="mt-4 sm:mt-5 flex items-center justify-center gap-2">
                <div className="h-px w-4 sm:w-6 bg-amber-400/40" />
                <p className="text-[#f3d6a0] text-xs sm:text-sm font-medium tracking-widest uppercase drop-shadow-md">
                  {quoteAuthor}
                </p>
                <div className="h-px w-4 sm:w-6 bg-amber-400/40" />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Section: Gift Banners, Liquid Glass Action Bar, & Sign-in status */}
      <footer className="absolute bottom-0 inset-x-0 z-20 pb-safe px-4 pb-3 sm:pb-5 flex flex-col items-center pointer-events-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Gift Claim Banner */}
          {isGiftClaimable && (
            <div className="w-full mb-2.5 rounded-2xl border border-amber-400/30 bg-neutral-950/70 backdrop-blur-xl saturate-150 p-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_12px_32px_rgba(0,0,0,0.6)] animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-inner">
                  <Gift className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white tracking-tight leading-snug">
                    Gifted MyInspireTag
                  </h4>
                  <p className="text-[10.5px] text-white/80 truncate">
                    {user ? "Add this tag to your account" : "Sign in to claim this tag"}
                  </p>
                </div>
                <button
                  onClick={handleClaimGift}
                  disabled={isClaiming}
                  className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-95 text-black px-3 py-1.5 text-xs font-bold shadow-lg transition-all duration-150 cursor-pointer disabled:opacity-50"
                >
                  {isClaiming ? "Claiming..." : user ? "Claim Gift" : "Sign In"}
                </button>
              </div>
            </div>
          )}

          {/* Gift Claimed Status */}
          {isGift && (isClaimed || data?.gift?.giftStatus === "claimed") && !isGiftClaimable && (
            <div className="w-full mb-2.5 rounded-xl border border-emerald-400/30 bg-emerald-950/80 backdrop-blur-xl px-3.5 py-1.5 shadow-xl flex items-center justify-center gap-2 animate-in fade-in duration-300">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-xs font-medium text-emerald-200">
                {isClaimed ? "This MyInspireTag is registered to your account!" : "Gift Claimed · MyInspireTag"}
              </p>
            </div>
          )}

          {/* Repeat Scan Notice (Same Day) */}
          {data?.isAlreadyUnlockedToday && data?.message && (
            <div className="w-full mb-2.5 rounded-2xl border border-amber-400/25 bg-neutral-950/80 backdrop-blur-xl px-3.5 py-1.5 shadow-lg flex items-center justify-center gap-2 text-center animate-in fade-in duration-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <p className="text-[11.5px] text-amber-200/90 font-light">
                {data.message}
              </p>
            </div>
          )}

          {/* Liquid Glass Floating Action Card (Compact & Optimized) */}
          <div className="backdrop-blur-2xl bg-neutral-950/50 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_12px_32px_rgba(0,0,0,0.7)] rounded-2xl py-2 px-3 sm:py-2.5 sm:px-4 max-w-[340px] sm:max-w-sm mx-auto flex justify-around items-center">
            {/* Save button */}
            <button
              onClick={handleFavoriteClick}
              disabled={favoriteLoading || !canFavorite}
              className="flex flex-col items-center gap-0.5 text-[#e6b76f] hover:text-white transition-all active:scale-95 disabled:opacity-40 cursor-pointer group"
              aria-label={saved ? "Saved to favorites" : "Save quote"}
            >
              <div
                className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all duration-200 ${saved
                    ? "bg-amber-400/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                    : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 group-hover:scale-105"
                  }`}
              >
                <Heart size={15} className={saved ? "fill-current text-amber-400" : ""} />
              </div>
              <span className="text-[9.5px] sm:text-[10px] font-medium tracking-tight">
                {saved ? "Saved" : "Save"}
              </span>
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-0.5 text-[#e6b76f] hover:text-white transition-all active:scale-95 cursor-pointer group"
              aria-label="Share quote"
            >
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 group-hover:scale-105 transition-all duration-200">
                <Share2 size={15} />
              </div>
              <span className="text-[9.5px] sm:text-[10px] font-medium tracking-tight">Share</span>
            </button>

            {/* Reflect button */}
            <button
              onClick={handleReflect}
              className="flex flex-col items-center gap-0.5 text-[#e6b76f] hover:text-white transition-all active:scale-95 cursor-pointer group"
              aria-label="Write a reflection"
            >
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 group-hover:scale-105 transition-all duration-200">
                <BookOpen size={15} />
              </div>
              <span className="text-[9.5px] sm:text-[10px] font-medium tracking-tight">Reflect</span>
            </button>

            {/* Collection button */}
            <button
              onClick={() => router.push(user ? "/dashboard/user/favorites" : "/login")}
              className="flex flex-col items-center gap-0.5 text-[#e6b76f] hover:text-white transition-all active:scale-95 cursor-pointer group"
              aria-label="View collection"
            >
              <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 group-hover:scale-105 transition-all duration-200">
                <Sparkles size={15} />
              </div>
              <span className="text-[9.5px] sm:text-[10px] font-medium tracking-tight">Collection</span>
            </button>
          </div>

          {/* User sign-in status (High Contrast Pill) */}
          <div className="mt-2.5 text-center">
            {user ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-white font-normal tracking-normal">
                  Signed in as <span className="text-amber-300 font-semibold">{user.name || user.email?.split('@')[0]}</span>
                </p>
              </div>
            ) : (
              <button
                onClick={() => goToAuth("login")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/25 hover:border-amber-400/50 text-xs text-white hover:text-amber-300 transition-all font-medium cursor-pointer shadow-sm"
              >
                <Sparkles size={11} className="text-amber-400" />
                <span>Sign in to save quotes to your collection</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-white/15 p-6 shadow-2xl relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300 text-white">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300">
                <Sparkles size={20} />
              </div>
            </div>

            <h3 className="text-[17px] font-semibold text-white text-center mb-1">
              Create an account to save this
            </h3>
            <p className="text-[13px] text-white/60 text-center mb-4 leading-relaxed font-light">
              Save quotes to your collection, track your inspiration history, and more — for free.
            </p>

            {quoteText && (
              <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 mb-5">
                <p className="text-[13px] text-amber-200/90 italic text-center line-clamp-2">&ldquo;{quoteText}&rdquo;</p>
              </div>
            )}

            <button
              onClick={() => goToAuth("register")}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-black text-sm font-bold shadow-lg active:scale-[0.98] transition-all duration-150 cursor-pointer"
            >
              Create Account — It&apos;s Free
            </button>

            <p className="mt-3.5 text-center text-[13px] text-white/60 font-light">
              Already have an account?{" "}
              <button
                onClick={() => goToAuth("login")}
                className="font-medium text-amber-300 underline underline-offset-2 hover:text-amber-200 transition-colors cursor-pointer"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-white/15 p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-semibold text-white mb-2">
              Premium required to save quotes
            </h3>
            <p className="text-white/70 text-sm mb-5 font-light leading-relaxed">
              Free accounts can&apos;t save quotes to favorites. Upgrade to Premium for unlimited saves and exclusive categories.
            </p>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-6">
              <p className="text-amber-200/90 italic text-center text-sm">&ldquo;{quoteText}&rdquo;</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/dashboard/user/premium")}
                className="h-11 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-black font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                Upgrade Now
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="h-11 rounded-xl border border-white/20 bg-white/5 text-white/80 font-medium text-sm hover:bg-white/10 hover:text-white transition cursor-pointer"
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
    </div>
  );
}