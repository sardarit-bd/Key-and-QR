"use client";

import BuyNowButton from "@/components/public/shop/product-details/BuyNowButton";

/**
 * StickyMobileBar — mobile-only sticky bottom purchase bar.
 */
export default function StickyMobileBar({
  product,
  selectedImage,
  selectedOption,
  customMessage,
  quantity,
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#EDE4D0] bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-[#2E2A24]">{product.name}</p>
          <p className="text-base font-bold text-[#2E2A24]">
            ${Number(product.price).toFixed(2)}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          <BuyNowButton
            product={product}
            selectedImage={selectedImage}
            selectedOption={selectedOption}
            customMessage={customMessage}
            quantity={quantity}
          />
        </div>
      </div>
    </div>
  );
}
