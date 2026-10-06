"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./GiftDedicationCard.module.css";

const GiftIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
  </svg>
);

const Heart = ({ filled = false, size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.8 3.6 4.8 6.8 4.8c2 0 3.7 1.1 5.2 3.1 1.5-2 3.2-3.1 5.2-3.1 3.2 0 5.1 3.4 4 6.3-1.7 4.8-9.2 9.4-9.2 9.4z" />
  </svg>
);

const Sparkle = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
);

const Ribbon = ({ className = "" }) => (
  <svg viewBox="0 0 230 120" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="rb-a" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#7a5012" />
        <stop offset="25%" stopColor="#d49e29" />
        <stop offset="50%" stopColor="#fde28e" />
        <stop offset="75%" stopColor="#d49e29" />
        <stop offset="100%" stopColor="#6e440b" />
      </linearGradient>
      <linearGradient id="rb-b" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fff8db" />
        <stop offset="100%" stopColor="#c59226" />
      </linearGradient>
    </defs>
    <path d="M0 62 C 18 40 40 22 70 10 C 40 34 26 62 24 120 L0 120 Z" fill="#4d3408" opacity=".95" />
    <path d="M0 96 C 8 52 70 10 176 0 L230 0 C 138 10 76 46 44 120 L0 120 Z" fill="url(#rb-a)" />
    <path d="M44 120 C 76 46 138 10 230 0" fill="none" stroke="url(#rb-b)" strokeWidth="1.5" opacity=".9" />
    <path d="M6 86 C 22 52 80 18 170 6" fill="none" stroke="#fff8db" strokeWidth="1.2" opacity=".45" />
  </svg>
);

// Comprehensive helper to extract a non-empty string value from diverse key formats
const extractText = (val) => {
  if (!val) return null;
  if (typeof val === "string") {
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof val === "object") {
    return (
      extractText(val.text) ||
      extractText(val.message) ||
      extractText(val.quoteText) ||
      extractText(val.quote) ||
      extractText(val.giftDedication?.text) ||
      extractText(val.giftDedication?.message) ||
      extractText(val.giftDedication?.quote) ||
      extractText(val.giftDedication) ||
      extractText(val.activeQuote?.quote) ||
      extractText(val.activeQuote?.text) ||
      extractText(val.activeQuote) ||
      extractText(val.latestQuote?.text) ||
      extractText(val.latestQuote?.quote) ||
      extractText(val.latestQuote) ||
      extractText(val.inspiration?.text) ||
      extractText(val.inspiration?.quote) ||
      extractText(val.inspiration) ||
      extractText(val.fullText) ||
      extractText(val.previewText) ||
      extractText(val.content) ||
      extractText(val.giftMessage) ||
      extractText(val.personalMessage) ||
      extractText(val.dedicationData) ||
      extractText(val.data) ||
      null
    );
  }
  return String(val).trim() || null;
};

// Comprehensive helper to extract sender name from diverse key formats
const extractSender = (val) => {
  if (!val) return null;
  if (typeof val === "string") {
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof val === "object") {
    return (
      extractSender(val.senderName) ||
      extractSender(val.giftSenderName) ||
      extractSender(val.from) ||
      extractSender(val.author) ||
      extractSender(val.giftDedication?.senderName) ||
      extractSender(val.giftDedication?.giftSenderName) ||
      extractSender(val.giftDedication?.author) ||
      extractSender(val.dedicationData?.senderName) ||
      extractSender(val.dedicationData?.giftSenderName) ||
      extractSender(val.dedicationData?.author) ||
      extractSender(val.activeQuote?.author) ||
      extractSender(val.latestQuote?.author) ||
      extractSender(val.inspiration?.author) ||
      extractSender(val.quote?.author) ||
      null
    );
  }
  return null;
};

export default function GiftDedicationCard({
  isOpen = true,
  senderName: directSenderName,
  message: directMessage,
  quoteText,
  text,
  quote,
  giftDedication,
  activeQuote,
  latestQuote,
  inspiration,
  data,
  dedicationData,
  onClose,
  ...props
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    // Explicitly restore document body styles when user triggers close
    if (typeof document !== "undefined") {
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("top");
      document.body.style.removeProperty("width");
    }
    onClose?.();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Capture the existing inline styles (instead of computed styles)
    const prevInlineOverflow = document.body.style.overflow;
    const prevInlinePosition = document.body.style.position;
    const prevInlineTop = document.body.style.top;
    const prevInlineWidth = document.body.style.width;

    // Apply scroll lock
    document.body.style.overflow = "hidden";

    return () => {
      // Revert styles cleanly upon close/unmount
      if (prevInlineOverflow && prevInlineOverflow !== "hidden") {
        document.body.style.overflow = prevInlineOverflow;
      } else {
        document.body.style.removeProperty("overflow");
      }

      if (prevInlinePosition) {
        document.body.style.position = prevInlinePosition;
      } else {
        document.body.style.removeProperty("position");
      }

      if (prevInlineTop) {
        document.body.style.top = prevInlineTop;
      } else {
        document.body.style.removeProperty("top");
      }

      if (prevInlineWidth) {
        document.body.style.width = prevInlineWidth;
      } else {
        document.body.style.removeProperty("width");
      }
    };
  }, [isOpen]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  // Resolve message with deep fallback across all potential keys and object structures
  const message =
    extractText(directMessage) ||
    extractText(quoteText) ||
    extractText(text) ||
    extractText(quote) ||
    extractText(giftDedication) ||
    extractText(dedicationData) ||
    extractText(activeQuote) ||
    extractText(latestQuote) ||
    extractText(inspiration) ||
    extractText(data) ||
    extractText(props?.message) ||
    extractText(props?.quoteText) ||
    extractText(props?.text) ||
    extractText(props?.quote) ||
    extractText(props?.giftDedication) ||
    extractText(props?.activeQuote) ||
    extractText(props?.dedicationData) ||
    "";

  // Resolve sender name with graceful fallback to "A Loved One"
  const senderName =
    extractSender(directSenderName) ||
    extractSender(props?.senderName) ||
    extractSender(giftDedication) ||
    extractSender(dedicationData) ||
    extractSender(activeQuote) ||
    extractSender(latestQuote) ||
    extractSender(inspiration) ||
    extractSender(data) ||
    extractSender(props?.author) ||
    "A Loved One";

  const pf = styles.playfair || "";

  return createPortal(
    <div className={styles.overlay} onClick={handleClose} role="dialog" aria-modal="true">
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={handleClose} className={styles.closeX} aria-label="Close">
          <CloseIcon />
        </button>

        <div className={styles.header}>
          <div className={styles.iconRow}>
            <span className={styles.sparkSmall}><Sparkle size={14} /></span>
            <div className={styles.giftCircle}>
              <GiftIcon />
            </div>
            <span className={styles.sparkSmall}><Sparkle size={14} /></span>
          </div>

          <div className={`${styles.badge} ${pf}`}>
            <Sparkle size={13} />
            <span>Personal Gift Dedication</span>
          </div>

          {senderName && (
            <h3 className={`${styles.from} ${pf}`}>
              <em>From</em> <strong>{senderName}</strong>
            </h3>
          )}

          <div className={styles.divider} aria-hidden="true">
            <span />
            <Heart filled size={18} />
            <span />
          </div>
        </div>

        <div className={styles.panel}>
          <Ribbon className={styles.ribbonTL} />
          <Ribbon className={styles.ribbonBR} />

          <span className={`${styles.quote} ${styles.quoteOpen} ${pf}`} aria-hidden="true">&ldquo;</span>
          <span className={`${styles.quote} ${styles.quoteClose} ${pf}`} aria-hidden="true">&rdquo;</span>

          <div className={styles.scrollContainer}>
            <blockquote className={`${styles.message} ${styles.cormorant || ""}`}>
              {message}
            </blockquote>

            {senderName && <div className={`${styles.signature} ${pf}`}>— {senderName}</div>}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}