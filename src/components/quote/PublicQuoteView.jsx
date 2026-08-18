"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, Sparkles, ShoppingBag, Heart } from "lucide-react";
import VisualQuoteRenderer from "@/components/quote/VisualQuoteRenderer";
import VisualQuoteAudioPlayer from "@/components/quote/VisualQuoteAudioPlayer";
import ShareQuoteModal from "@/components/quote/ShareQuoteModal";
import useShareQuote from "@/hooks/useShareQuote";
import { getBestShareArtwork } from "@/utils/share.utils";

export default function PublicQuoteView({ quote, quoteId }) {
  const { isShareOpen, shareData, openShare, closeShare, shareQuote } = useShareQuote();

  const artworkUrl = getBestShareArtwork(quote);
  const editorData = quote?.editorData;
  const hasVisualDesign = Boolean(
    artworkUrl ||
    (editorData &&
      ((editorData.desktop?.elements && editorData.desktop.elements.length > 0) ||
        (editorData.mobile?.elements && editorData.mobile.elements.length > 0) ||
        (editorData.elements && editorData.elements.length > 0)))
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
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
      {/* Visual Quote Container */}
      <div className="relative w-full overflow-hidden rounded-3xl border border-white/15 bg-neutral-950 shadow-2xl p-3 sm:p-4">
        {hasVisualDesign ? (
          <div className="relative w-full min-h-[420px] max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl">
            {editorData ? (
              <VisualQuoteRenderer
                editorData={editorData}
                mode="auto"
                showAudioPlayer={false}
                className="w-full h-full"
              />
            ) : artworkUrl ? (
              <img
                src={artworkUrl}
                alt={quote.text || "Daily Inspiration"}
                className="w-full h-auto max-h-[70vh] object-contain rounded-2xl shadow-xl"
              />
            ) : null}
          </div>
        ) : (
          <div className="py-16 px-6 sm:px-8 text-center my-auto">
            <blockquote className="text-xl sm:text-2xl font-medium text-white drop-shadow-md leading-relaxed italic">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            {quote.author && (
              <p className="mt-4 text-sm font-semibold text-amber-400">
                — {quote.author} —
              </p>
            )}
          </div>
        )}

        {/* Audio Player if available */}
        {audioTrack?.source && (
          <div className="mt-3 flex justify-center">
            <VisualQuoteAudioPlayer track={audioTrack} />
          </div>
        )}

        {/* Action Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={handleShareClick}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 py-3 px-4 text-xs font-semibold text-white transition cursor-pointer"
            aria-label="Share this inspiration"
          >
            <Share2 className="h-4 w-4 text-amber-400" />
            <span>Share Inspiration</span>
          </button>

          <Link
            href="/shop"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 py-3 px-4 text-xs font-bold text-black shadow-lg transition"
          >
            <Sparkles className="h-4 w-4" />
            <span>Get My Tag</span>
          </Link>
        </div>
      </div>

      {/* Unified Share Modal */}
      <ShareQuoteModal
        isOpen={isShareOpen}
        onClose={closeShare}
        quoteData={shareData}
      />
    </div>
  );
}
