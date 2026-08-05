"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

import { useProduct } from "@/hooks/product-service/useProducts";

import ProductGallery from "@/components/shop/product-details/ProductGallery";
import ProductBreadcrumb from "@/components/product-details/ProductBreadcrumb";
import ProductSummary from "@/components/product-details/ProductSummary";
import ProductActions from "@/components/product-details/ProductActions";
import FeatureHighlights from "@/components/product-details/FeatureHighlights";
import ProductInfoTabs from "@/components/product-details/ProductInfoTabs";
import StickyMobileBar from "@/components/product-details/StickyMobileBar";
import ProductDetailsSkeleton from "@/components/skeletons/ProductDetailsSkeleton";
import RelatedProducts from "@/components/shop/Relatedproduct";

/**
 * ProductDetails — orchestrator only.
 *
 * Layout:
 *   Breadcrumb
 *   Product Section   (left: gallery | right: summary + actions)
 *   FeatureHighlights (full width)
 *   ProductInfoTabs   (full width)
 *   RelatedProducts
 *   StickyMobileBar   (mobile)
 */
export const ProductDetails = () => {
  const { id } = useParams();
  const reduceMotion = useReducedMotion();

  // Product query
  const { data, isLoading, error, refetch, isRefetching } = useProduct(id);
  const product = data?.data || null;

  // Shared purchase state
  const [selectedOption, setSelectedOption] = useState("self");
  const [customMessage, setCustomMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

  // Set selected image when product loads
  useEffect(() => {
    if (product) {
      setSelectedImage(product.image?.url || "/placeholder.png");
    }
  }, [product]);

  // ************* Loading State *************
  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  // ************* Error State *************
  if (error || !product) {
    return (
      <section className="bg-[#FDFBF6] text-[#2E2A24] py-16">
        <div className="max-w-7xl px-4 mx-auto text-center">
          <div className="bg-white rounded-2xl border border-[#EDE4D0] p-10 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-[#8A2E2E] mb-2">Product Not Found</h2>
            <p className="text-[#5C5346] mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="cursor-pointer bg-[#2E2A24] hover:bg-[#1F1C18]"
              >
                {isRefetching ? "Loading..." : "Retry"}
              </Button>
              <Link href="/shop">
                <Button
                  variant="outline"
                  className="cursor-pointer border-[#E5DCC8] text-[#2E2A24]"
                >
                  Back to Shop
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ************* Main Render *************
  return (
    <section className="bg-[#FDFBF6] text-[#2E2A24] pb-28 lg:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <ProductBreadcrumb productName={product.name} />

        {/* Product Section — two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[52%_48%] gap-8 lg:gap-14">
          {/* LEFT: Gallery */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductGallery product={product} />
          </motion.div>

          {/* RIGHT: Purchase information */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            <div className="lg:sticky lg:top-8 space-y-6">
              <ProductSummary product={product} />
              <ProductActions
                product={product}
                selectedImage={selectedImage}
                selectedOption={selectedOption}
                onOptionChange={setSelectedOption}
                customMessage={customMessage}
                onGiftMessageChange={setCustomMessage}
                quantity={quantity}
                onQuantityChange={setQuantity}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature Highlights — full width */}
      <FeatureHighlights />

      {/* Product Information — full width */}
      <ProductInfoTabs product={product} />

      {/* Related Products — same card as Shop */}
      <RelatedProducts currentProductId={product._id} />

      {/* Mobile sticky bottom purchase bar */}
      <StickyMobileBar
        product={product}
        selectedImage={selectedImage}
        selectedOption={selectedOption}
        customMessage={customMessage}
        quantity={quantity}
      />
    </section>
  );
};

export default ProductDetails;
