"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ProductImage } from "@/components/ui/ProductImage";
import {
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ProductGallery = ({ product }) => {
  const reduceMotion = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const touchStartX = useRef(null);

  // Build gallery from backend data (main image + gallery array)
  const gallery = useMemo(() => {
    const images = [];
    if (product?.image?.url) {
      images.push({ url: product.image.url, isMain: true, label: "Main Image" });
    }
    if (product?.gallery?.length) {
      product.gallery.forEach((img, idx) => {
        if (img?.url) {
          images.push({ url: img.url, isMain: false, label: `Gallery ${idx + 1}` });
        }
      });
    }
    if (images.length === 0) {
      images.push({ url: "/placeholder.png", isMain: true, label: "Placeholder" });
    }
    return images;
  }, [product]);

  const hasMultipleImages = gallery.length > 1;
  const current = gallery[selectedIndex] || gallery[0];

  // Reset selection when product changes
  useEffect(() => {
    setSelectedIndex(0);
    setZoom(1);
  }, [product?._id]);

  // Reset zoom when lightbox closes
  useEffect(() => {
    if (!isFullscreen) setZoom(1);
  }, [isFullscreen]);

  // Keyboard navigation (arrow keys) when not fullscreen — moves selection
  useEffect(() => {
    if (!hasMultipleImages) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") {
        setSelectedIndex((i) => (i + 1) % gallery.length);
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((i) => (i - 1 + gallery.length) % gallery.length);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hasMultipleImages, gallery.length]);

  // Fullscreen: escape to close + scroll lock (portal renders at document.body)
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "ArrowRight") setSelectedIndex((i) => (i + 1) % gallery.length);
      if (e.key === "ArrowLeft") setSelectedIndex((i) => (i - 1 + gallery.length) % gallery.length);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isFullscreen, gallery.length]);

  const goNext = useCallback((e) => {
    e?.stopPropagation();
    setZoom(1);
    setSelectedIndex((i) => (i + 1) % gallery.length);
  }, [gallery.length]);

  const goPrev = useCallback((e) => {
    e?.stopPropagation();
    setZoom(1);
    setSelectedIndex((i) => (i - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  // Mobile swipe support
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const openLightbox = useCallback(() => setIsFullscreen(true), []);
  const closeLightbox = useCallback(() => setIsFullscreen(false), []);

  return (
    <div className="lg:sticky lg:top-8">
      {/* Main image */}
      <div
        className="group relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#F5F0E4] shadow-[0_12px_40px_-16px_rgb(60_45_15/0.2)]"
        onClick={openLightbox}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="button"
        tabIndex={0}
        aria-label="Open image preview"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox();
          }
        }}
      >
        {product.stock <= 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rotate-[-6deg] rounded-lg bg-[#7A2E2E] px-6 py-3 text-lg font-bold text-white shadow-xl">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Fade transition on image switch */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.url}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <ProductImage
              src={current.url}
              alt={product.name}
              width={600}
              height={600}
              fill={false}
              priority
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom hint */}
        <span className="pointer-events-none absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[#5C5346] opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          <Maximize2 className="h-4 w-4" />
        </span>

        {/* Arrow nav (multi-image) */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-[#5C5346] opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-[#2E2A24] group-hover:opacity-100"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-[#5C5346] opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-[#2E2A24] group-hover:opacity-100"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Image counter */}
        {hasMultipleImages && (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-[#2E2A24]/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {selectedIndex + 1} / {gallery.length}
          </span>
        )}
      </div>

      {/* Thumbnail rail */}
      {hasMultipleImages && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
          {gallery.map((img, index) => (
            <button
              key={img.url + index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6922D]/50 focus-visible:ring-offset-2",
                selectedIndex === index
                  ? "ring-2 ring-[#C6922D] ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              )}
              aria-label={`View ${img.label}`}
              aria-pressed={selectedIndex === index}
            >
              <ProductImage
                src={img.url}
                alt={img.label}
                width={80}
                height={80}
                fill={false}
                className="h-full w-full object-cover"
              />
              {img.isMain && (
                <span className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-0.5 bg-black/70 py-0.5 text-[9px] font-medium text-white">
                  <Star className="h-2.5 w-2.5 fill-[#E8C985] text-[#E8C985]" />
                  MAIN
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox — rendered in a portal at document.body, above everything */}
      <LightboxPortal
        isOpen={isFullscreen}
        onClose={closeLightbox}
        gallery={gallery}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        goNext={goNext}
        goPrev={goPrev}
        zoom={zoom}
        setZoom={setZoom}
        current={current}
        productName={product.name}
        hasMultipleImages={hasMultipleImages}
        reduceMotion={reduceMotion}
      />
    </div>
  );
};

/**
 * LightboxPortal — true fullscreen modal.
 * - Rendered via createPortal(document.body) so it escapes the product layout.
 * - Full-viewport dark backdrop with a very high z-index.
 * - Body scroll locked while open (handled in ProductGallery effect).
 */
function LightboxPortal({
  isOpen,
  onClose,
  gallery,
  selectedIndex,
  setSelectedIndex,
  goNext,
  goPrev,
  zoom,
  setZoom,
  current,
  productName,
  hasMultipleImages,
  reduceMotion,
}) {
  // Only render on the client (createPortal needs document).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[rgba(15,13,10,0.94)] backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", overflow: "hidden" }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lightbox"
            className="absolute right-5 top-5 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:rotate-90 hover:bg-white/20"
          >
            <X size={20} />
          </button>

          {/* Prev / Next — vertically centered */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            disabled={!hasMultipleImages}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            disabled={!hasMultipleImages}
            aria-label="Next image"
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={22} />
          </button>

          {/* Zoom controls */}
          <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/10 p-1.5 backdrop-blur-sm">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1))); }}
              disabled={zoom <= 1}
              aria-label="Zoom out"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ZoomOut size={17} />
            </button>
            <span className="min-w-12 text-center text-[13px] font-medium tabular-nums text-white/80">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(3, +(z + 0.5).toFixed(1))); }}
              disabled={zoom >= 3}
              aria-label="Zoom in"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ZoomIn size={17} />
            </button>
          </div>

          {/* Zoomed image — perfectly centered */}
          <motion.div
            key={current.url}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: zoom }}
            transition={{ duration: 0.25, type: "spring", stiffness: 260, damping: 24 }}
            className="flex max-h-[70vh] max-w-[85vw] items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ transformOrigin: "center" }}
          >
            <ProductImage
              src={current.url}
              alt={productName}
              width={1000}
              height={1000}
              fill={false}
              className="max-h-[70vh] max-w-[85vw] object-contain"
            />
          </motion.div>

          {/* Thumbnail strip */}
          {hasMultipleImages && (
            <div
              className="absolute bottom-4 left-1/2 z-10 flex max-w-[90vw] -translate-x-1/2 items-center gap-2 overflow-x-auto px-4 py-1 hide-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {gallery.map((img, index) => (
                <button
                  key={img.url + index}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6922D]/60",
                    selectedIndex === index
                      ? "ring-2 ring-[#C6922D]"
                      : "opacity-50 hover:opacity-90"
                  )}
                  aria-label={`View ${img.label}`}
                  aria-pressed={selectedIndex === index}
                >
                  <ProductImage
                    src={img.url}
                    alt={img.label}
                    width={48}
                    height={48}
                    fill={false}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Counter */}
          {hasMultipleImages && (
            <span className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 text-[12px] font-medium text-white/70">
              {selectedIndex + 1} / {gallery.length}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default ProductGallery;
