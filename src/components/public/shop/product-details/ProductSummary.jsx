"use client";

import { motion, useReducedMotion } from "framer-motion";
import StockStatusBadge from "@/components/public/shop/product-details/StockStatusBadge";

/**
 * ProductSummary — category badge, product name, price, stock, description.
 * Pure presentational; all data comes from the backend product.
 */
export default function ProductSummary({ product }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      {/* Category + brand */}
      <div className="flex flex-wrap items-center gap-2">
        {product.category && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#C6922D]/25 bg-[#C6922D]/10 px-3 py-1 text-[11px] font-semibold text-[#A6782B]">
            {product.category}
          </span>
        )}
        {product.brand && (
          <span className="text-[13px] text-[#A99B7F]">
            by <span className="font-medium text-[#5C5346]">{product.brand}</span>
          </span>
        )}
      </div>

      {/* Name */}
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-[#2E2A24]">
        {product.name}
      </h1>

      {/* Price + stock */}
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-3xl font-bold tracking-tight text-[#2E2A24]">
          ${Number(product.price).toFixed(2)}
        </p>
        <StockStatusBadge stock={product.stock} />
      </div>

      {/* Short description */}
      <p className="text-[15px] leading-relaxed text-[#5C5346]">
        {product.description}
      </p>
    </motion.div>
  );
}
