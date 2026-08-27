"use client";

import Link from "next/link";

/**
 * ShopBreadcrumb — the single compact breadcrumb style used across
 * Shop, Product Details, Cart, and Checkout. Matches the Shop page
 * exactly: spacing, typography, colors, sizing, alignment.
 *
 * @param {Array<{label: string, href?: string}>} items — breadcrumb trail,
 *        last item is rendered as the current page (non-link).
 */
export default function ShopBreadcrumb({ items }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 py-4 text-[12px] text-[#A99B7F]"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label + index} className="flex items-center gap-1.5">
            {index > 0 && <span>/</span>}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="cursor-pointer transition-colors hover:text-[#A6782B]"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-[#5C5346]" : "text-[#A99B7F]"}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
