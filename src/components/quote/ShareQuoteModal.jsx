"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Download, Share2, Sparkles, ImageOff } from "lucide-react";
import { FaWhatsapp, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import { toast } from "react-hot-toast";
import {
  getBestShareArtwork,
  getPublicShareUrl,
  formatShareText,
  downloadQuoteArtwork,
} from "@/utils/share.utils";

export default function ShareQuoteModal({ isOpen, onClose, quoteData, quote }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const activeQuoteData = quoteData || quote;

  if (!isOpen || !activeQuoteData) return null;

  const publicUrl = getPublicShareUrl(activeQuoteData);
  const shareText = formatShareText(activeQuoteData);
  const resolvedArtwork = activeQuoteData.imageUrl || getBestShareArtwork(activeQuoteData);
  const artworkUrl = !imageError && resolvedArtwork ? resolvedArtwork : null;
  const quoteId = activeQuoteData.quoteId || activeQuoteData._id || activeQuoteData.id || "quote";

  const handleCopyLink = async () => {
    let success = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicUrl);
        success = true;
      }
    } catch {
      // Clipboard API restricted
    }

    if (!success) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = publicUrl;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.opacity = "0.001";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch (err) {
        console.warn("Fallback copy failed:", err);
      }
    }

    setCopied(true);
    toast.success("Quote link copied!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = async () => {
    if (!artworkUrl) {
      toast.error("No artwork image available to download");
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
        title: "MyInspireTag Daily Inspiration",
        text: `${shareText}\n\n${publicUrl}`,
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
            {/* Quote Artwork & Text Preview Box */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-4 text-center">
              {artworkUrl ? (
                <div className="mb-3.5 flex max-h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-black/60 border border-white/5">
                  <img
                    src={artworkUrl}
                    alt="Quote Artwork"
                    onError={() => setImageError(true)}
                    className="max-h-48 w-auto object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="mb-3.5 flex h-28 w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br from-neutral-800/80 via-neutral-900/90 to-black border border-white/5 p-3 text-center">
                  <Sparkles className="h-5 w-5 text-amber-400/70 mb-1.5" />
                  <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
                    MyInspireTag Inspiration
                  </span>
                </div>
              )}
              <blockquote className="text-sm font-medium text-white/95 italic leading-relaxed line-clamp-3">
                &ldquo;{quoteData.text || quoteData.quote}&rdquo;
              </blockquote>
              {quoteData.author && (
                <p className="mt-2 text-xs font-semibold text-amber-300">
                  — {quoteData.author}
                </p>
              )}
            </div>

            {/* Real Social Action Icons */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 py-3.5 text-xs font-semibold text-[#25D366] transition cursor-pointer active:scale-95"
                aria-label="Share via WhatsApp"
              >
                <FaWhatsapp className="h-5 w-5" />
                <span>WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={handleFacebook}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/30 py-3.5 text-xs font-semibold text-[#1877F2] transition cursor-pointer active:scale-95"
                aria-label="Share via Facebook"
              >
                <FaFacebookF className="h-5 w-5" />
                <span>Facebook</span>
              </button>

              {/* X / Twitter */}
              <button
                onClick={handleTwitter}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 py-3.5 text-xs font-semibold text-white transition cursor-pointer active:scale-95"
                aria-label="Share via X"
              >
                <FaXTwitter className="h-5 w-5" />
                <span>X / Twitter</span>
              </button>
            </div>

            {/* Actions Bar: Download Image & Copy Link */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/15 py-2.5 px-4 text-xs font-semibold text-white transition cursor-pointer active:scale-95 ${
                  artworkUrl
                    ? "bg-white/10 hover:bg-white/15"
                    : "bg-white/5 text-white/50 cursor-not-allowed"
                } disabled:opacity-50`}
                aria-label="Download artwork image"
              >
                <Download className="h-4 w-4 text-amber-400" />
                <span>{downloading ? "Downloading..." : "Download Image"}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 py-2.5 px-4 text-xs font-bold text-black shadow-lg transition cursor-pointer active:scale-95"
                aria-label="Copy public link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Link Copied!" : "Copy Link"}</span>
              </button>
            </div>

            {/* More Options Button (Mobile/Native) */}
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
