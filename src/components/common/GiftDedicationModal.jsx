"use client";

import React from "react";
import GiftDedicationCard from "./GiftDedicationCard";

/**
 * GiftDedicationModal Wrapper
 * Provides backward-compatible prop mapping to the production-ready GiftDedicationCard
 */
export default function GiftDedicationModal({
  isOpen = false,
  onClose,
  dedicationData = {},
  onSaveDedication,
  onSave,
  isSaving = false,
  saveButton = null,
  message: directMessage,
  quoteText,
  text,
  quote,
  senderName: directSenderName,
  giftDedication,
  activeQuote,
  ...props
}) {
  if (!isOpen) return null;

  const senderName =
    directSenderName ||
    dedicationData?.senderName ||
    dedicationData?.giftSenderName ||
    dedicationData?.author ||
    giftDedication?.senderName ||
    giftDedication?.giftSenderName ||
    activeQuote?.author ||
    props?.senderName ||
    "";

  const message =
    directMessage ||
    dedicationData?.message ||
    dedicationData?.quoteText ||
    dedicationData?.text ||
    dedicationData?.quote ||
    quoteText ||
    text ||
    quote ||
    giftDedication?.text ||
    giftDedication?.message ||
    giftDedication?.quote ||
    activeQuote?.quote ||
    activeQuote?.text ||
    props?.message ||
    props?.quoteText ||
    props?.text ||
    props?.quote ||
    "";

  const isSaved = Boolean(
    dedicationData?.isFavorite ||
    dedicationData?.isSaved ||
    dedicationData?.saved ||
    props?.isFavorite ||
    props?.isSaved
  );

  return (
    <GiftDedicationCard
      isOpen={isOpen}
      onClose={onClose}
      senderName={senderName}
      message={message}
      dedicationData={dedicationData}
      giftDedication={giftDedication || dedicationData}
      activeQuote={activeQuote}
      onSave={onSaveDedication || onSave || dedicationData?.onSave}
      isSaved={isSaved}
      isSaving={isSaving}
      saveButton={saveButton}
      {...props}
    />
  );
}

export { GiftDedicationCard };
