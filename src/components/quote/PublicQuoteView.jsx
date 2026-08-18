"use client";

import Link from "next/link";
import { Share2, Sparkles, ShoppingBag } from "lucide-react";
import VisualQuoteRenderer from "@/components/quote/VisualQuoteRenderer";
import VisualQuoteAudioPlayer from "@/components/quote/VisualQuoteAudioPlayer";
import ShareQuoteModal from "@/components/quote/ShareQuoteModal";
import useShareQuote from "@/hooks/useShareQuote";
import { getBestShareArtwork } from "@/utils/share.utils";
import { getCategoryLabel } from "@/components/category";

export default function PublicQuoteView({ quote, quoteId }) {
  const { isShareOpen, shareData, closeShare, shareQuote } = useShareQuote();

  const artworkUrl = getBestShareArtwork(quote);
  const editorData = quote?.editorData;
  const categoryLabel = getCategoryLabel(quote?.category || "inspire");

  const hasFabricCanvas = Boolean(
    editorData &&
      ((editorData.desktop?.elements && editorData.desktop.elements.length > 0) ||
        (editorData.mobile?.elements && editorData.mobile.elements.length > 0) ||
        (editorData.elements && editorData.elements.length > 0))
  );

  const audioTrack =
    quote?.editorData?.desktop?.elements?.find((e) => e.type === "audio" && e.audioData?.source)?.audioData ||
    quote?.editorData?.mobile?.elements?.find((e) => e.type === "audio" && e.audioData?.source)?.audioData ||
    quote?.editorData?.desktop?.audio ||
    quote?.editorData?.mobile?.audio ||
    null;

  const handleShareClick = () => {
    shareQuote({
      quoteId,
      text: quote.text,
      author: quote.author,
      category: quote.category,
      imageUrl: artworkUrl,
    });
  };

  return (
    <div className="relative w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Visual Quote Card */}
      <div className="relative w-full overflow-hidden rounded-3xl border border-white/15 bg-neutral-950/90 shadow-2xl backdrop-blur-xl p-5 sm:p-7">
        
        {/* Category Pill */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="capitalize">{categoryLabel}</span>
          </span>
          <span className="text-[11px] font-medium tracking-wide text-white/50 uppercase">
            Daily Inspiration
          </span>
        </div>

        {/* Artwork or Canvas if available */}
        {hasFabricCanvas ? (
          <div className="relative w-full min-h-[300px] max-h-[55vh] flex items-center justify-center overflow-hidden rounded-2xl mb-5 bg-black/50">
            <VisualQuoteRenderer
              editorData={editorData}
              mode="auto"
              showAudioPlayer={false}
              className="w-full h-full"
            />
          </div>
        ) : artworkUrl ? (
          <div className="relative w-full flex items-center justify-center overflow-hidden rounded-2xl mb-5 bg-black/50">
            <img
              src={artworkUrl}
              alt={quote.text || "Daily Inspiration"}
              className="w-full h-auto max-h-[55vh] object-contain rounded-2xl shadow-lg"
            />
          </div>
        ) : null}

        {/* Prominent Quote Text & Author */}
        <div className="py-4 text-center">
          <blockquote className="text-xl sm:text-2xl font-serif font-medium text-white/95 leading-relaxed tracking-tight">
            &ldquo;{quote.text}&rdquo;
          </blockquote>
          {quote.author && (
            <p className="mt-3 text-sm font-semibold tracking-wider text-amber-400">
              — {quote.author}
            </p>
          )}
        </div>

        {/* Audio Player if present */}
        {audioTrack?.source && (
          <div className="mt-3 flex justify-center">
            <VisualQuoteAudioPlayer track={audioTrack} />
          </div>
        )}

        {/* Action Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={handleShareClick}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 py-3 px-4 text-xs font-semibold text-white transition cursor-pointer active:scale-[0.98]"
            aria-label="Share this inspiration"
          >
            <Share2 className="h-4 w-4 text-amber-400" />
            <span>Share Inspiration</span>
          </button>

          <Link
            href="/shop"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 py-3 px-4 text-xs font-bold text-black shadow-lg transition active:scale-[0.98]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Get My Tag</span>
          </Link>
        </div>
      </div>

      {/* Unified Share Quote Modal */}
      <ShareQuoteModal
        isOpen={isShareOpen}
        onClose={closeShare}
        quoteData={shareData}
      />
    </div>
  );
}
