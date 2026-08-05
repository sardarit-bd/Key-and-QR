"use client";

import { useMemo, useState, useEffect, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  Heart,
  Loader2,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCartStore } from "@/store/cartStore";
import { useFavoriteStatus, useToggleFavoriteMutation } from "@/hooks/favorite-service/useFavorites";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

/**
 * ProductCard — the single premium product card used across the Shop page
 * AND Related Products. Keeps every surface visually identical.
 *
 * Business logic (add to cart, wishlist, quick view) is unchanged.
 */

function ProductCardBase({ product, index = 0, priority = false }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const addToCart = useCartStore((s) => s.addToCart);
  const { isAuthenticated } = useAuthStore();
  const { data: favData } = useFavoriteStatus(product._id, null);
  const toggleFav = useToggleFavoriteMutation();
  const [isAdding, setIsAdding] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Escape closes the quick-view modal + body scroll lock
  useEffect(() => {
    if (!isQuickViewOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setIsQuickViewOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isQuickViewOpen]);

  const isFavorite = favData?.exists || false;
  const stock = product.stock ?? 0;
  const outOfStock = stock <= 0;

  const stockMeta = useMemo(() => {
    if (outOfStock) return { label: "Out of Stock", cls: "bg-[#7A2E2E] text-[#FDE8E8]" };
    if (stock <= 2) return { label: "Only " + stock + " left", cls: "bg-[#8A5A1B] text-[#FCE8CB]" };
    return { label: "In Stock", cls: "bg-[#2E5B3A] text-[#E4F2E8]" };
  }, [stock, outOfStock]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || isAdding) return;
    setIsAdding(true);
    const result = await addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      img: product.image?.url,
      qty: 1,
      purchaseType: "self",
      giftMessage: null,
    });
    setIsAdding(false);
    if (result?.success) toast.success(`${product.name} added to cart`);
    else if (result?.error) toast.error(result.error);
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) {
      sessionStorage.setItem("pendingFavorite", JSON.stringify({ productId: product._id }));
      toast.error("Please login to add favorites");
      router.push(`/login?redirect=/shop/${product._id}`);
      return;
    }
    try {
      await toggleFav.mutateAsync({
        productId: product._id,
        isFavorite,
        favoriteId: favData?.favoriteId || null,
      });
    } catch (err) {
      console.error("Favorite error:", err);
    }
  };

  // Quick View — modal ONLY, never navigates.
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <motion.div
        layout
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: (index % 4) * 0.05, ease: [0.22, 1, 0.36, 1] }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={reduceMotion ? undefined : { y: -8, rotateX: 1.5, scale: 1.005 }}
        whileTap={reduceMotion ? undefined : { scale: 0.995 }}
        style={reduceMotion ? undefined : { perspective: 1000 }}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#EDE4D0]/80 bg-white will-change-transform shadow-[0_2px_12px_-4px_rgb(60_45_15/0.08)] transition-[border-color,box-shadow] duration-300 hover:border-[#C6922D]/35 hover:shadow-[0_28px_56px_-24px_rgb(60_45_15/0.35),0_0_24px_-8px_rgba(198,146,45,0.18)]"
      >
        {/* Image area — clicking navigates to details */}
        <Link
          href={`/shop/${product._id}`}
          className="relative block aspect-square w-full overflow-hidden bg-[#F5F0E4] cursor-pointer"
          aria-label={product.name}
        >
          <ProductImage
            src={product.image?.url}
            alt={product.name}
            width={400}
            height={400}
            fill={false}
            priority={priority || index < 4}
            className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08] group-hover:brightness-[1.06]"
          />

          {/* Category badge */}
          {product.category && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7A5C2E] backdrop-blur-sm">
              <Sparkles size={9} className="text-[#C6922D]" />
              {product.category}
            </span>
          )}

          {/* Stock badge */}
          <span className={`absolute right-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm backdrop-blur-sm ${stockMeta.cls}`}>
            {stockMeta.label}
          </span>

          {/* Hover overlay — dark gradient fades in from bottom */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F1C18]/80 via-[#1F1C18]/20 to-transparent"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* Hover quick actions — staggered Framer Motion reveal */}
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2">
            <motion.button
              type="button"
              onClick={handleQuickView}
              initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.95 }}
              animate={reduceMotion ? undefined : { opacity: hovered ? 1 : 0, y: hovered ? 0 : 20, scale: hovered ? 1 : 0.95 }}
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#2E2A24]/90 text-[12px] font-semibold text-[#F5EDDC] backdrop-blur-sm transition-colors duration-300 hover:bg-[#2E2A24]"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye size={14} /> Quick View
            </motion.button>
            <motion.button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock || isAdding}
              initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.95 }}
              animate={reduceMotion ? undefined : { opacity: hovered ? 1 : 0, y: hovered ? 0 : 20, scale: hovered ? 1 : 0.95 }}
              whileHover={reduceMotion ? undefined : { scale: 1.05 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              transition={{ duration: 0.25, delay: 0.075, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#C6922D] text-white shadow-[0_4px_16px_-4px_rgba(198,146,45,0.5)] transition-colors duration-300 hover:bg-[#A6782B] disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={`Add ${product.name} to cart`}
            >
              {isAdding ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <ShoppingCart size={15} />
              )}
            </motion.button>
          </div>
        </Link>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-semibold leading-snug text-[#2E2A24] line-clamp-1">
              <Link href={`/shop/${product._id}`} className="transition-colors hover:text-[#A6782B]">
                {product.name}
              </Link>
            </h3>
            <motion.button
              type="button"
              onClick={handleFavorite}
              whileHover={reduceMotion ? undefined : { scale: 1.15 }}
              whileTap={reduceMotion ? undefined : { scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={`relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-[border-color,background-color,box-shadow] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6922D]/50 focus-visible:ring-offset-2 ${
                isFavorite
                  ? "border-[#C25B5B]/30 bg-[#FCE8E8] text-[#C25B5B] shadow-[0_0_12px_-2px_rgba(194,91,91,0.4)]"
                  : "border-[#E5DCC8] text-[#A99B7F] hover:border-[#C6922D]/40 hover:text-[#C6922D] hover:shadow-[0_0_12px_-4px_rgba(198,146,45,0.45)]"
              }`}
            >
              <Heart
                size={14}
                className={`transition-all duration-200 ${isFavorite ? "fill-current" : ""}`}
              />
            </motion.button>
          </div>

          <p className="mt-1.5 text-[12px] leading-relaxed text-[#8A7A5C] line-clamp-2">
            {product.description}
          </p>

          <div className="mt-auto flex items-center justify-between pt-3">
            <p className="text-lg font-bold tracking-tight text-[#2E2A24]">
              ${Number(product.price).toFixed(2)}
            </p>
            <Link
              href={`/shop/${product._id}`}
              className="inline-flex cursor-pointer items-center gap-1 text-[12px] font-semibold text-[#A6782B] transition-all duration-200 hover:gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6922D]/40 rounded-sm"
            >
              View <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal — never navigates */}
      <AnimatePresence>
        {isQuickViewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#2E2A24]/50 p-4 backdrop-blur-sm"
            onClick={() => setIsQuickViewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`${product.name} quick view`}
            >
              <button
                type="button"
                onClick={() => setIsQuickViewOpen(false)}
                aria-label="Close quick view"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#5C5346] shadow-md transition-all duration-200 hover:rotate-90 hover:text-[#2E2A24]"
              >
                <X size={16} />
              </button>

              <div className="relative aspect-square w-full overflow-hidden bg-[#F5F0E4]">
                <ProductImage
                  src={product.image?.url}
                  alt={product.name}
                  width={400}
                  height={400}
                  fill={false}
                  className="h-full w-full object-cover"
                />
                <span className={`absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm ${stockMeta.cls}`}>
                  {stockMeta.label}
                </span>
              </div>

              <div className="p-6">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A6782B]">
                  {product.category}
                </span>
                <h3 className="mt-1 text-xl font-bold text-[#2E2A24]">{product.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#8A7A5C] line-clamp-3">
                  {product.description}
                </p>
                <p className="mt-4 text-2xl font-bold tracking-tight text-[#2E2A24]">
                  ${Number(product.price).toFixed(2)}
                </p>

                <div className="mt-5 flex gap-3">
                  <Link
                    href={`/shop/${product._id}`}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#2E2A24] py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#1F1C18] active:scale-[0.98]"
                  >
                    View Details <ArrowRight size={15} />
                  </Link>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={outOfStock || isAdding}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#C6922D] py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#A6782B] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isAdding ? <Loader2 size={15} className="animate-spin" /> : <ShoppingCart size={15} />}
                    {isAdding ? "Adding..." : "Add to Cart"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const ProductCard = memo(ProductCardBase);
export default ProductCard;
