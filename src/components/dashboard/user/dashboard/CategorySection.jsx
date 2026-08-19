"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { resolveCategory } from "@/components/dashboard/admin/categories/categoryIconRegistry";
import { getCategoryIcon } from "@/components/category";

function hexToRgba(hex, alpha = 0.1) {
  if (!hex || typeof hex !== 'string') return `rgba(239, 68, 68, ${alpha})`;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length !== 6) return hex;
  const num = parseInt(c, 16);
  if (Number.isNaN(num)) return hex;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Category Card Icon Component
 * Securely renders custom category SVG/image assets with automatic fallback to Lucide icons.
 */
function CategoryCardIcon({ category, categoryColor }) {
  const [imageError, setImageError] = useState(false);
  const slug = category?.slug || category?.name?.toLowerCase() || '';
  const iconUrl = category?.iconUrl;

  // Resolve the canonical icon from the registry (respects icon name, slug aliases, and global fallback)
  const resolved = resolveCategory(category);
  const IconComponent = resolved?.Icon || getCategoryIcon(category?.icon || slug) || Sparkles;

  if (iconUrl && !imageError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconUrl}
        alt={category?.name || 'Category icon'}
        className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] object-contain transition-transform duration-200 group-hover:scale-110"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <IconComponent
      size={20}
      strokeWidth={2.2}
      className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] transition-transform duration-200 group-hover:scale-110"
      style={{ color: categoryColor }}
    />
  );
}

export default function CategorySection({
  categories,
  onSelectCategory,
  disabled,
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const categoryList = Array.isArray(categories) ? categories : [];

  const handleClick = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    } else {
      const slug = category?.slug || category?.name?.toLowerCase() || '';
      if (slug) {
        router.push(`/inspiration/${slug}`);
      }
    }
  };

  const handleViewAll = () => {
    router.push("/inspiration");
  };

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h2 className="text-[18px] sm:text-[19px] md:text-[20px] font-semibold tracking-tight text-foreground">
          Explore Categories
        </h2>
        <button
          onClick={handleViewAll}
          className="group inline-flex cursor-pointer items-center gap-1.5 text-[13px] sm:text-[14px] font-medium text-foreground-tertiary hover:text-accent transition-colors duration-200"
        >
          View All
          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-1 py-3">
        {categoryList.length > 0 ? (
          categoryList.map((category, index) => {
            const slug = category?.slug || category?.name || "";
            const categoryColor = category?.color || (slug === 'love' ? '#ef4444' : '#f59e0b');
            const quoteCount = typeof category?.quoteCount === 'number'
              ? category.quoteCount
              : typeof category?.count === 'number'
                ? category.count
                : null;

            return (
              <motion.button
                key={category?.id || category?._id || slug || index}
                onClick={() => handleClick(category)}
                disabled={disabled}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={
                  !reduceMotion
                    ? { y: -3, transition: { duration: 0.2 } }
                    : undefined
                }
                whileTap={!reduceMotion ? { scale: 0.97 } : undefined}
                className={`
                  group relative flex flex-shrink-0 flex-col items-center justify-center gap-2
                  min-w-[96px] sm:min-w-[104px] md:min-w-[108px]
                  rounded-2xl border px-4 py-4 sm:py-5
                  transition-all duration-200
                  cursor-pointer
                  bg-white/75 dark:bg-slate-900/50 backdrop-blur-md dark:backdrop-blur-lg
                  border border-white/80 dark:border-white/[0.12]
                  shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_4px_20px_-4px_rgba(0,0,0,0.05)]
                  dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_30px_rgba(0,0,0,0.22)]
                  hover:bg-white/90 dark:hover:bg-slate-900/65
                  hover:border-accent/40 dark:hover:border-white/20
                  hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_8px_28px_-6px_rgba(0,0,0,0.08)]
                  dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_12px_36px_rgba(0,0,0,0.32)]
                `}
                aria-label={`${category?.name || slug} category`}
              >
                {/* Primary Category Icon with dynamic color container */}
                <span
                  className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: hexToRgba(categoryColor, 0.1),
                    borderWidth: 1,
                    borderColor: hexToRgba(categoryColor, 0.22),
                  }}
                >
                  <CategoryCardIcon category={category} categoryColor={categoryColor} />
                </span>

                {/* Category Name */}
                <span className="text-[12px] sm:text-[13px] font-semibold text-center leading-tight whitespace-nowrap text-foreground-secondary group-hover:text-foreground transition-colors">
                  {category?.name || "Inspire"}
                </span>

                {/* Status / Quote count label */}
                <span className="text-[10px] font-medium text-foreground-tertiary/75">
                  {quoteCount !== null ? `${quoteCount} ${quoteCount === 1 ? 'quote' : 'quotes'}` : 'Explore'}
                </span>
              </motion.button>
            );
          })
        ) : (
          <p className="py-8 text-[13px] text-foreground-tertiary">
            No categories available right now.
          </p>
        )}
      </div>
    </section>
  );
}

