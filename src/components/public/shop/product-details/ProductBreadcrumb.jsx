"use client";

import ShopBreadcrumb from "@/components/public/shop/ShopBreadcrumb";

/**
 * ProductBreadcrumb — Home / Shop / <product name>
 * Uses the shared ShopBreadcrumb for consistency.
 */
export default function ProductBreadcrumb({ productName }) {
  return (
    <ShopBreadcrumb
      items={[
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: productName },
      ]}
    />
  );
}
