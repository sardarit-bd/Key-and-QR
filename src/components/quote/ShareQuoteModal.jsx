"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Download, Share2, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getBestShareArtwork,
  getPublicShareUrl,
  formatShareText,
  downloadQuoteArtwork,
} from "@/utils/share.utils";

export default function ShareQuoteModal({ isOpen, onClose, quoteData }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !quoteData) return null;

  const publicUrl = getPublicShareUrl(quoteData);
  const shareText = formatShareText(quoteData);
  const artworkUrl = quoteData.imageUrl || getBestShareArtwork(quoteData);
  const quoteId = quoteData.quoteId || quoteData._id || quoteData.id || "quote";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Quote link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDownload = async () => {
    if (!artworkUrl) {
      toast.error("No artwork available to download");
      return;
    }
    setDownloading(true);
    try {
      await downloadQuoteArtwork(artworkUrl, `myinspiretag-${quoteId}.webp`);
      toast.success("Artwork downloaded!");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to download image. Try copying the link instead.");
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsApp = () => {
    const message = `${shareText}\n\n${publicUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(publicUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: "MyInspireTag",
        text: shareText,
        url: publicUrl,
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Native share failed:", err);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-neutral-900 text-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h3 className="text-base font-semibold">Share Inspiration</h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Quote Artwork / Preview */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 text-center">
              {artworkUrl ? (
                <div className="mb-3 flex max-h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-black/60">
                  <img
                    src={artworkUrl}
                    alt="Quote Artwork"
                    className="max-h-48 w-auto object-contain rounded-xl"
                  />
                </div>
              ) : null}
              <blockquote className="text-sm font-medium text-white/90 italic leading-relaxed line-clamp-4">
                &ldquo;{quoteData.text || quoteData.quote}&rdquo;
              </blockquote>
              {quoteData.author && (
                <p className="mt-2 text-xs font-semibold text-amber-300">
                  — {quoteData.author}
                </p>
              )}
            </div>

            {/* Social Sharing Actions */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 py-3 text-xs font-semibold text-[#25D366] transition cursor-pointer"
                aria-label="Share via WhatsApp"
              >
                <span className="text-base">💬</span>
                <span>WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleFacebook}
                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/30 py-3 text-xs font-semibold text-[#1877F2] transition cursor-pointer"
                aria-label="Share via Facebook"
              >
                <span className="text-base">📘</span>
                <span>Facebook</span>
              </button>

              {/* X / Twitter */}
              <button
                onClick={handleTwitter}
                className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 py-3 text-xs font-semibold text-white transition cursor-pointer"
                aria-label="Share via X"
              >
                <span className="text-base">𝕏</span>
                <span>X / Twitter</span>
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              {artworkUrl && (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 py-2.5 px-4 text-xs font-semibold text-white transition cursor-pointer disabled:opacity-50"
                  aria-label="Download artwork image"
                >
                  <Download className="h-4 w-4 text-amber-400" />
                  <span>{downloading ? "Downloading..." : "Download Image"}</span>
                </button>
              )}

              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 py-2.5 px-4 text-xs font-bold text-black shadow-lg transition cursor-pointer"
                aria-label="Copy public link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Link Copied!" : "Copy Link"}</span>
              </button>
            </div>

            {/* Native Share button if available on mobile */}
            {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 py-2 text-xs font-medium text-white/80 transition cursor-pointer"
                aria-label="More share options"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>More options...</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
