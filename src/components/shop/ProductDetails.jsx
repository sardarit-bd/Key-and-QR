"use client";

import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { ProductImage } from "@/components/ui/ProductImage";
import { AlertCircle, BadgeCheck, Heart, Minus, Plus, Star, Zap } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import RelatedProducts from "./Relatedproduct";
import { useFavoriteStatus, useToggleFavoriteMutation } from "@/hooks/favorite-service/useFavorites";
import { useProduct } from "@/hooks/product-service/useProducts";

// Stock Status Component
const StockStatusBadge = ({ stock }) => {
    if (stock <= 0) {
        return (
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold">
                <AlertCircle size={20} />
                <span>Out of Stock</span>
            </div>
        );
    } else if (stock <= 2) {
        return (
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-semibold">
                <AlertCircle size={20} />
                <span>Only {stock} {stock === 1 ? 'keychain' : 'keychains'} left!</span>
            </div>
        );
    }
    return (
        <div className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-lg">
            <span className="text-sm flex items-center gap-1">
                <BadgeCheck size={15} />
                In Stock ({stock} available)
            </span>
        </div>
    );
};

export default function ProductDetails() {
    const { id } = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const addToCart = useCartStore((state) => state.addToCart);

    // Product query
    const { data, isLoading, error, refetch, isRefetching } = useProduct(id);
    const product = data?.data || null;

    // Favorite query
    const { data: favoriteData, isLoading: isFavoriteLoading } = useFavoriteStatus(id, null);
    const isFavorite = favoriteData?.exists || false;
    const favoriteId = favoriteData?.favoriteId || null;

    // Toggle favorite mutation
    const toggleFavoriteMutation = useToggleFavoriteMutation();

    // UI State
    const [selectedOption, setSelectedOption] = useState("self");
    const [customMessage, setCustomMessage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState("");
    const [isMainImageSelected, setIsMainImageSelected] = useState(true);

    // Set selected image when product loads
    useEffect(() => {
        if (product) {
            const mainImage = product.image?.url || "/placeholder.png";
            setSelectedImage(mainImage);
            setIsMainImageSelected(true);
        }
    }, [product]);

    // Handle favorite toggle
    const handleFavorite = async () => {
        if (!isAuthenticated()) {
            // Store pending favorite and redirect
            sessionStorage.setItem('pendingFavorite', JSON.stringify({ productId: product._id }));
            toast.error("Please login to add favorites");
            router.push(`/login?redirect=/shop/${product._id}`);
            return;
        }

        try {
            await toggleFavoriteMutation.mutateAsync({
                productId: product._id,
                isFavorite,
                favoriteId,
            });
        } catch (error) {
            // Error handled by mutation
            console.error('Favorite error:', error);
        }
    };

    // Add to cart
    const handleAdd = () => {
        if (!product || product.stock <= 0) return;

        const qtyToAdd = Math.min(quantity, product.stock);

        addToCart({
            id: product._id,
            name: product.name,
            price: product.price,
            img: selectedImage,
            qty: qtyToAdd,
            purchaseType: selectedOption === "gift" ? "gift" : "self",
            giftMessage: selectedOption === "gift" ? customMessage?.trim() || null : null,
        });

        toast.success(`Added ${qtyToAdd} ${product.name} to cart`);
    };

    // Buy now
    const handleBuyNow = () => {
        if (!product || product.stock <= 0) return;

        const qtyToAdd = Math.min(quantity, product.stock);

        addToCart({
            id: product._id,
            name: product.name,
            price: product.price,
            img: selectedImage,
            qty: qtyToAdd,
            purchaseType: selectedOption === "gift" ? "gift" : "self",
            giftMessage: selectedOption === "gift" ? customMessage?.trim() || null : null,
        });

        router.push("/checkout");
    };

    // Image handlers
    const handleThumbnailClick = (imageUrl, isMain) => {
        setSelectedImage(imageUrl);
        setIsMainImageSelected(isMain);
    };

    // Build gallery
    const getGalleryImages = () => {
        const images = [];

        if (product?.image?.url) {
            images.push({
                url: product.image.url,
                isMain: true,
                label: "Main Image"
            });
        }

        if (product?.gallery && product.gallery.length > 0) {
            product.gallery.forEach((img, idx) => {
                if (img?.url) {
                    images.push({
                        url: img.url,
                        isMain: false,
                        label: `Gallery ${idx + 1}`
                    });
                }
            });
        }

        if (images.length === 0) {
            images.push({
                url: "/placeholder.png",
                isMain: true,
                label: "Placeholder"
            });
        }

        return images;
    };

    // Loading state
    if (isLoading) {
        return (
            <section className="bg-white text-black py-16">
                <div className="max-w-7xl px-4 mx-auto flex justify-center items-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading product...</p>
                    </div>
                </div>
            </section>
        );
    }

    // Error state with refetch
    if (error || !product) {
        return (
            <section className="bg-white text-black py-16">
                <div className="max-w-7xl px-4 mx-auto text-center">
                    <div className="bg-red-50 rounded-lg p-8 max-w-md mx-auto">
                        <h2 className="text-xl font-semibold text-red-600 mb-2">Product Not Found</h2>
                        <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button 
                                onClick={() => refetch()} 
                                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                                disabled={isRefetching}
                            >
                                {isRefetching ? 'Loading...' : 'Retry'}
                            </button>
                            <Link
                                href="/shop"
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Back to Shop
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const gallery = getGalleryImages();
    const hasMultipleImages = gallery.length > 1;

    return (
        <section className="bg-white text-black py-16">
            <div className="max-w-7xl px-4 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* LEFT: IMAGE GALLERY */}
                <div>
                    <div className="relative w-full rounded-xl overflow-hidden shadow-lg mb-2 bg-gray-100">
                        {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                <span className="bg-red-600 text-white text-xl font-bold px-6 py-3 rounded-lg transform -rotate-12">
                                    OUT OF STOCK
                                </span>
                            </div>
                        )}

                        <ProductImage
                            src={selectedImage}
                            alt={product.name}
                            width={600}
                            height={600}
                            className="w-full h-auto object-cover rounded-xl transition-all duration-300"
                            fill={false}
                            priority
                        />
                    </div>

                    {hasMultipleImages && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                                <span>Product Images</span>
                                <span className="text-xs text-gray-400">({gallery.length} images)</span>
                            </p>
                            <div className="flex gap-3 flex-wrap">
                                {gallery.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleThumbnailClick(img.url, img.isMain)}
                                        className={`relative group transition-all duration-200 cursor-pointer ${
                                            selectedImage === img.url ? "ring-2 ring-offset-2 ring-black scale-105" : "hover:scale-105"
                                        }`}
                                        aria-label={`View ${img.label}`}
                                    >
                                        <div className={`relative border-2 rounded-lg overflow-hidden ${
                                            selectedImage === img.url ? "border-black" : "border-transparent group-hover:border-gray-300"
                                        }`}>
                                            <ProductImage
                                                src={img.url}
                                                alt={img.label}
                                                width={80}
                                                height={80}
                                                className="object-cover w-20 h-20 transition"
                                                fill={false}
                                            />

                                            {img.isMain && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] font-medium py-1 text-center flex items-center justify-center gap-1">
                                                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                                    <span>MAIN</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: PRODUCT INFO */}
                <div className="flex flex-col justify-center space-y-5">
                    <h1 className="text-3xl font-semibold">{product.name}</h1>
                    <p className="text-2xl font-medium text-gray-800">${Number(product.price).toFixed(2)}</p>

                    <div className="my-2">
                        <StockStatusBadge stock={product.stock} />
                    </div>

                    <p className="text-gray-600 leading-relaxed">{product.description}</p>

                    <p className="text-sm text-gray-500">
                        <strong>Brand:</strong> {product.brand || "Sardar IT"} &nbsp;|&nbsp;
                        <strong>Category:</strong> {product.category}
                    </p>

                    {/* Customize Options */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Your Message</h2>

                        <div className="space-y-4">
                            <button
                                onClick={() => setSelectedOption('self')}
                                className={`w-full text-left p-5 rounded-xl border-2 transition-all cursor-pointer ${
                                    selectedOption === 'self' 
                                        ? 'border-gray-900 bg-gray-50' 
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                                aria-pressed={selectedOption === 'self'}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                            selectedOption === 'self' ? 'border-gray-900' : 'border-gray-300'
                                        }`}>
                                            {selectedOption === 'self' && <div className="w-2.5 h-2.5 rounded-full bg-gray-900"></div>}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">Purchase for yourself</h3>
                                        <p className="text-sm text-gray-500">We'll select a beautiful quote from our collection</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setSelectedOption('gift')}
                                className={`w-full text-left p-5 rounded-xl border-2 transition-all cursor-pointer ${
                                    selectedOption === 'gift' 
                                        ? 'border-gray-900 bg-gray-900' 
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                                aria-pressed={selectedOption === 'gift'}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                            selectedOption === 'gift' ? 'border-white' : 'border-gray-300'
                                        }`}>
                                            {selectedOption === 'gift' && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-semibold mb-1 ${selectedOption === 'gift' ? 'text-white' : 'text-gray-900'}`}>
                                            Purchase for Gift
                                        </h3>
                                        <p className={`text-sm ${selectedOption === 'gift' ? 'text-gray-300' : 'text-gray-500'}`}>
                                            Personalize with your own words
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {selectedOption === 'gift' && (
                                <div className="animate-fadeIn">
                                    <textarea
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        placeholder="Write something meaningful..."
                                        rows={4}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors resize-none text-gray-900 placeholder:text-gray-400"
                                        aria-label="Gift message"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quantity + Buttons */}
                    <div className="flex flex-wrap items-center gap-4 mt-1">
                        <div className="flex items-center border border-gray-300 py-1 rounded-md p-2">
                            <button
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                disabled={product.stock <= 0}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                aria-label="Decrease quantity"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="px-4 py-2 min-w-[50px] text-center" aria-label={`Quantity: ${quantity}`}>
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                                disabled={quantity >= product.stock || product.stock <= 0}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                aria-label="Increase quantity"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        <button
                            onClick={handleAdd}
                            disabled={product.stock <= 0}
                            className={`px-6 py-3 border rounded-md transition flex-1 md:flex-none cursor-pointer ${
                                product.stock <= 0 
                                    ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
                                    : 'border-gray-700 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>

                        <button
                            onClick={handleFavorite}
                            disabled={toggleFavoriteMutation.isPending || isFavoriteLoading}
                            className={`px-4 py-3 border rounded-md flex items-center gap-2 transition cursor-pointer ${
                                isFavorite 
                                    ? "bg-red-500 text-white border-red-500" 
                                    : "border-gray-700 hover:bg-gray-700 hover:text-white"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            {toggleFavoriteMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                            ) : (
                                <Heart size={18} className={isFavorite ? "fill-white" : ""} />
                            )}
                            {isFavorite ? "Saved" : "Save"}
                        </button>

                        <button
                            onClick={handleBuyNow}
                            className={`px-6 py-3 rounded-md transition flex-1 md:flex-none text-center cursor-pointer ${
                                product.stock <= 0 
                                    ? 'bg-gray-400 text-white cursor-not-allowed pointer-events-none' 
                                    : 'bg-gray-700 text-white hover:bg-gray-800'
                            }`}
                        >
                            Buy it Now
                        </button>
                    </div>

                    {product.stock <= 2 && product.stock > 0 && (
                        <p className="flex items-center gap-1 text-orange-600 text-sm font-medium animate-pulse">
                            <Zap size={16} /> Hurry! Only {product.stock} {product.stock === 1 ? 'item' : 'items'} left in stock
                        </p>
                    )}
                </div>
            </div>

            {/* Related Products */}
            {product && <RelatedProducts currentProductId={product._id} />}
        </section>
    );
}