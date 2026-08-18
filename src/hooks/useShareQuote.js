"use client";

import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  getBestShareArtwork,
  getPublicShareUrl,
  formatShareText,
} from "@/utils/share.utils";

/**
 * Centralized Quote Share Hook
 * Provides seamless native file sharing on mobile and fallback Share Modal on desktop.
 */
export function useShareQuote() {
  const [isOpen, setIsOpen] = useState(false);
  const [quoteData, setQuoteData] = useState(null);

  const openShareModal = useCallback((data) => {
    setQuoteData(data);
    setIsOpen(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setIsOpen(false);
    setQuoteData(null);
  }, []);

  const shareQuote = useCallback(async (data) => {
    if (!data) return;

    const publicUrl = getPublicShareUrl(data);
    const shareText = formatShareText(data);
    const artworkUrl = data.imageUrl || getBestShareArtwork(data);

    // 1. Try Native Mobile Share
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        let fileToShare = null;

        // Try preparing artwork file if supported
        if (artworkUrl && typeof navigator.canShare === "function") {
          try {
            const res = await fetch(artworkUrl);
            if (res.ok) {
              const blob = await res.blob();
              const ext = blob.type.split("/")[1] || "webp";
              const file = new File([blob], `myinspiretag-quote.${ext}`, {
                type: blob.type,
              });

              if (navigator.canShare({ files: [file] })) {
                fileToShare = file;
              }
            }
          } catch (fileErr) {
            console.warn("Could not fetch image for native share:", fileErr);
          }
        }

        const sharePayload = {
          title: "MyInspireTag",
          text: shareText,
          url: publicUrl,
        };

        if (fileToShare) {
          sharePayload.files = [fileToShare];
        }

        await navigator.share(sharePayload);
        return; // Native share completed or handed off to OS
      } catch (err) {
        if (err.name === "AbortError") {
          // User intentionally closed the native share sheet — do not show error or modal
          return;
        }
        console.warn("Native share failed, falling back to Share Modal:", err);
      }
    }

    // 2. Fallback to Share Modal (Desktop or unsupported native share)
    openShareModal(data);
  }, [openShareModal]);

  return {
    isShareOpen: isOpen,
    shareData: quoteData,
    openShare: openShareModal,
    closeShare: closeShareModal,
    shareQuote,
  };
}

export default useShareQuote;
