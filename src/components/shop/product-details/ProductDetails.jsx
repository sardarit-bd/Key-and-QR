"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useProduct } from "@/hooks/product-service/useProducts";

import ProductGallery from "./ProductGallery";
import StockStatusBadge from "./StockStatusBadge";
import PurchaseOptions from "./PurchaseOptions";
import AddToCartSection from "./AddToCartSection";
import FavoriteButton from "./FavoriteButton";
import BuyNowButton from "./BuyNowButton";
import RelatedProducts from "@/components/shop/Relatedproduct";

export const ProductDetails = () => {
    const { id } = useParams();

    // Product query
    const { data, isLoading, error, refetch, isRefetching } = useProduct(id);
    const product = data?.data || null;

    // UI State
    const [selectedOption, setSelectedOption] = useState("self");
    const [customMessage, setCustomMessage] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState("");

    // Set selected image when product loads
    useState(() => {
        if (product) {
            const mainImage = product.image?.url || "/placeholder.png";
            setSelectedImage(mainImage);
        }
    }, [product]);

    // ************* Loading State *************
    if (isLoading) {
        return (
            <section className="bg-white text-black py-16">
                <div className="max-w-7xl px-4 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <Skeleton className="w-full aspect-square rounded-xl" />
                        <div className="flex gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <div className="flex gap-4">
                            <Skeleton className="h-12 w-32" />
                            <Skeleton className="h-12 w-32" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // ************* Error State *************
    if (error || !product) {
        return (
            <section className="bg-white text-black py-16">
                <div className="max-w-7xl px-4 mx-auto text-center">
                    <div className="bg-red-50 rounded-lg p-8 max-w-md mx-auto">
                        <h2 className="text-xl font-semibold text-red-600 mb-2">
                            Product Not Found
                        </h2>
                        <p className="text-gray-600 mb-4">
                            The product you're looking for doesn't exist or has been removed.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => refetch()}
                                disabled={isRefetching}
                                className="cursor-pointer"
                            >
                                {isRefetching ? 'Loading...' : 'Retry'}
                            </Button>
                            <Link href="/shop">
                                <Button variant="outline" className="cursor-pointer">
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
        <section className="bg-white text-black py-16">
            <div className="max-w-7xl px-4 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* LEFT: Gallery */}
                <ProductGallery product={product} />

                {/* RIGHT: Product Info */}
                <div className="flex flex-col justify-center space-y-5">
                    <h1 className="text-3xl font-semibold">{product.name}</h1>
                    <p className="text-2xl font-medium text-gray-800">
                        ${Number(product.price).toFixed(2)}
                    </p>

                    <StockStatusBadge stock={product.stock} />

                    <p className="text-gray-600 leading-relaxed">{product.description}</p>

                    <p className="text-sm text-gray-500">
                        <strong>Brand:</strong> {product.brand || "Sardar IT"} &nbsp;|&nbsp;
                        <strong>Category:</strong> {product.category}
                    </p>

                    {/* Purchase Options */}
                    <PurchaseOptions
                        selectedOption={selectedOption}
                        onOptionChange={setSelectedOption}
                        giftMessage={customMessage}
                        onGiftMessageChange={setCustomMessage}
                    />

                    {/* Actions */}
                    <div className="flex flex-wrap items-start gap-4 mt-2">
                        <div className="flex-1 min-w-[200px]">
                            <AddToCartSection
                                product={product}
                                selectedImage={selectedImage}
                                selectedOption={selectedOption}
                                customMessage={customMessage}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <FavoriteButton productId={product._id} />
                            <BuyNowButton
                                product={product}
                                selectedImage={selectedImage}
                                selectedOption={selectedOption}
                                customMessage={customMessage}
                                quantity={quantity}
                            />
                        </div>
                    </div>

                    {/* Low Stock Warning */}
                    {product.stock <= 2 && product.stock > 0 && (
                        <p className="flex items-center gap-1 text-orange-600 text-sm font-medium animate-pulse">
                            <span className="text-lg">⚡</span>
                            Hurry! Only {product.stock} {product.stock === 1 ? 'item' : 'items'} left in stock
                        </p>
                    )}
                </div>
            </div>

            {/* Related Products */}
            <RelatedProducts currentProductId={product._id} />
        </section>
    );
};

export default ProductDetails;