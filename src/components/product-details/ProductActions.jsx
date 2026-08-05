"use client";

import PurchaseOptions from "@/components/shop/product-details/PurchaseOptions";
import AddToCartSection from "@/components/shop/product-details/AddToCartSection";
import FavoriteButton from "@/components/shop/product-details/FavoriteButton";
import BuyNowButton from "@/components/shop/product-details/BuyNowButton";

/**
 * ProductActions — purchase options + quantity/action buttons + low-stock
 * warning. All business logic lives in the child components; this only
 * composes them with the shared purchase state.
 */
export default function ProductActions({
  product,
  selectedImage,
  selectedOption,
  onOptionChange,
  customMessage,
  onGiftMessageChange,
  quantity,
  onQuantityChange,
}) {
  return (
    <div className="space-y-5">
      {/* Purchase options */}
      <PurchaseOptions
        selectedOption={selectedOption}
        onOptionChange={onOptionChange}
        giftMessage={customMessage}
        onGiftMessageChange={onGiftMessageChange}
      />

      {/* Quantity + Add to Cart */}
      <div className="flex flex-wrap items-center gap-3">
        <AddToCartSection
          product={product}
          selectedImage={selectedImage}
          selectedOption={selectedOption}
          customMessage={customMessage}
        />
      </div>

      {/* Buy Now + Save */}
      <div className="flex flex-wrap items-center gap-3">
        <BuyNowButton
          product={product}
          selectedImage={selectedImage}
          selectedOption={selectedOption}
          customMessage={customMessage}
          quantity={quantity}
        />
        <FavoriteButton productId={product._id} />
      </div>

      {/* Low stock warning */}
      {product.stock <= 2 && product.stock > 0 && (
        <p className="flex items-center gap-2 rounded-xl bg-[#FCE8CB] px-4 py-3 text-sm font-medium text-[#7A4A10]">
          <span className="text-base">⚡</span>
          Hurry! Only {product.stock} {product.stock === 1 ? "item" : "items"} left in stock
        </p>
      )}
    </div>
  );
}
