"use client";

import { useState, useCallback } from "react";
import {
  getBestShareArtwork,
  getPublicShareUrl,
  formatShareText,
} from "@/utils/share.utils";

function isMobileDevice() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const isSmallScreen = window.innerWidth <= 768;
  return isMobileUA || (isSmallScreen && Boolean(navigator.maxTouchPoints) && navigator.maxTouchPoints > 1);
}

/**
 * Centralized Quote Share Hook
 * - On Mobile: Uses native OS share with artwork File attachment (when supported).
 * - On Desktop: Seamlessly opens the Share Quote Modal (WhatsApp, Facebook, X, Download, Copy).
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

  const shareQuote = useCallback(
    async (data) => {
      if (!data) return;

      const publicUrl = getPublicShareUrl(data);
      const shareText = formatShareText(data);
      const artworkUrl = data.imageUrl || getBestShareArtwork(data);

      // 1. Mobile Native Share
      if (
        isMobileDevice() &&
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function"
      ) {
        try {
          let fileToShare = null;

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
            title: "MyInspireTag Daily Inspiration",
            text: `${shareText}\n\n${publicUrl}`,
            url: publicUrl,
          };

          if (fileToShare) {
            sharePayload.files = [fileToShare];
          }

          await navigator.share(sharePayload);
          return; // Handled by mobile OS share sheet
        } catch (err) {
          if (err.name === "AbortError") {
            return; // User cancelled share sheet
          }
          console.warn("Native share error, falling back to modal:", err);
        }
      }

      // 2. Desktop or Fallback: Open Share Quote Modal
      openShareModal(data);
    },
    [openShareModal]
  );

  return {
    isShareOpen: isOpen,
    shareData: quoteData,
    openShare: openShareModal,
    closeShare: closeShareModal,
    shareQuote,
  };
}

export default useShareQuote;
