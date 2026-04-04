"use client";

import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useProductStore } from "@/store/productStore";
import { AlertCircle, BadgeCheck, Heart, Minus, Plus, Star, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RelatedProducts from "./Relatedproduct";

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
    // ========== ALL HOOKS FIRST ==========
    const { id } = useParams();
    const { products, fetchProducts, getProductById, loading: storeLoading } = useProductStore();
    const addToCart = useCartStore((state) => state.addToCart);

    // State declarations
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState('gift');
    const [customMessage, setCustomMessage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState("");
    const [imageError, setImageError] = useState(false);
    const [isMainImageSelected, setIsMainImageSelected] = useState(true);

    const { accessToken } = useAuthStore();

    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteId, setFavoriteId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const router = useRouter();

    // ========== EFFECTS ==========
    // Load product data
    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);

            try {
                if (products.length === 0) {
                    await fetchProducts();
                }

                const found = getProductById(id);
                setProduct(found || null);
            } catch (error) {
                console.error("Error loading product:", error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadProduct();
        }
    }, [id, products.length, fetchProducts, getProductById]);

    // Set selected image when product loads
    useEffect(() => {
        if (product) {
            const galleryImages = [];
            
            // Add main image first
            if (product.image?.url) {
                galleryImages.push({
                    url: product.image.url,
                    isMain: true,
                    index: 0
                });
            }
            
            // Add gallery images
            if (product.gallery && product.gallery.length > 0) {
                product.gallery.forEach((img, idx) => {
                    if (img?.url) {
                        galleryImages.push({
                            url: img.url,
                            isMain: false,
                            index: idx + 1
                        });
                    }
                });
            }
            
            // If no images at all, use placeholder
            if (galleryImages.length === 0) {
                galleryImages.push({
                    url: "/placeholder.png",
                    isMain: true,
                    index: 0
                });
            }
            
            // Set selected image to MAIN image (first in array)
            setSelectedImage(galleryImages[0].url);
            setIsMainImageSelected(true);
        }
    }, [product]);

    useEffect(() => {
        if (product && accessToken) {
            checkFavoriteStatus(product._id);
        }
    }, [product, accessToken]);

    // ========== HANDLER FUNCTIONS ==========
    const handleAdd = () => {
        if (!product || product.stock <= 0) return;

        const qtyToAdd = Math.min(quantity, product.stock);
        for (let i = 0; i < qtyToAdd; i++) {
            addToCart({
                id: product._id,
                name: product.name,
                price: product.price,
                img: selectedImage,
            });
        }
    };

    const checkFavoriteStatus = async (productId) => {
        if (!accessToken) return;

        try {
            const res = await api.get("/favorites");
            const favorites = res.data.data || [];

            const fav = favorites.find(
                (f) => f.product?._id?.toString() === productId.toString()
            );

            if (fav) {
                setIsFavorite(true);
                setFavoriteId(fav._id);
            } else {
                setIsFavorite(false);
                setFavoriteId(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleFavorite = async () => {
        if (!accessToken) {
            alert("Login first");
            return;
        }

        setIsSaving(true);

        try {
            if (isFavorite) {
                await api.delete(`/favorites/${favoriteId}`);
                setIsFavorite(false);
                setFavoriteId(null);
            } else {
                const res = await api.post("/favorites", {
                    productId: product._id,
                });

                setIsFavorite(true);
                setFavoriteId(res.data.data._id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBuyNow = () => {
        if (!product || product.stock <= 0) return;

        const qtyToAdd = Math.min(quantity, product.stock);

        for (let i = 0; i < qtyToAdd; i++) {
            addToCart({
                id: product._id,
                name: product.name,
                price: product.price,
                img: selectedImage,
                qty: 1
            });
        }
        router.push("/checkout");
    };

    const handleImageError = (e) => {
        e.target.src = "/placeholder.png";
        e.target.onerror = null;
        setImageError(true);
    };

    const handleThumbnailClick = (imageUrl, isMain) => {
        setSelectedImage(imageUrl);
        setIsMainImageSelected(isMain);
    };

    // ========== CONDITIONAL RETURNS ==========

    // Loading state
    if (loading || storeLoading) {
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

    // Not found
    if (!product) {
        return (
            <section className="bg-white text-black py-16">
                <div className="max-w-7xl px-4 mx-auto text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product Not Found</h2>
                    <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
                    <Link
                        href="/shop"
                        className="inline-block px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
                    >
                        Back to Shop
                    </Link>
                </div>
            </section>
        );
    }

    // Build gallery array for thumbnails with main image info
    const getGalleryImages = () => {
        const images = [];
        
        // Add main image with flag
        if (product.image?.url) {
            images.push({
                url: product.image.url,
                isMain: true,
                label: "Main Image"
            });
        }
        
        // Add gallery images
        if (product.gallery && product.gallery.length > 0) {
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
        
        // If no images, add placeholder
        if (images.length === 0) {
            images.push({
                url: "/placeholder.png",
                isMain: true,
                label: "Placeholder"
            });
        }
        
        return images;
    };
    
    const gallery = getGalleryImages();
    const mainImage = gallery.find(img => img.isMain);
    const hasMultipleImages = gallery.length > 1;

    return (
        <section className="bg-white text-black py-16">
            <div className="max-w-7xl px-4 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* LEFT: IMAGE GALLERY */}
                <div>
                    {/* Main Display Area */}
                    <div className="relative w-full rounded-xl overflow-hidden shadow-lg mb-2 bg-gray-100">
                        {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                <span className="bg-red-600 text-white text-xl font-bold px-6 py-3 rounded-lg transform -rotate-12">
                                    OUT OF STOCK
                                </span>
                            </div>
                        )}
                        
                        {/* Main Image Badge - shows when main image is displayed */}
                        {isMainImageSelected && (
                            <div className="absolute top-4 left-4 z-10 bg-black/75 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-sm">
                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">Main Image</span>
                            </div>
                        )}
                        
                        <Image
                            src={selectedImage || "/placeholder.png"}
                            alt={product.name || "Product"}
                            width={600}
                            height={600}
                            className="w-full h-auto object-cover rounded-xl transition-all duration-300"
                            onError={handleImageError}
                            unoptimized={true}
                            priority
                        />
                    </div>

                    {/* Thumbnails with Main Image Indicator */}
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
                                        className={`relative group transition-all duration-200 ${
                                            selectedImage === img.url 
                                                ? "ring-2 ring-offset-2 ring-black scale-105" 
                                                : "hover:scale-105"
                                        }`}
                                    >
                                        <div className={`relative border-2 rounded-lg overflow-hidden ${
                                            selectedImage === img.url 
                                                ? "border-black" 
                                                : "border-transparent group-hover:border-gray-300"
                                        }`}>
                                            <Image
                                                src={img.url || "/placeholder.png"}
                                                alt={`${img.label}`}
                                                width={80}
                                                height={80}
                                                className="object-cover w-20 h-20 transition"
                                                onError={handleImageError}
                                                unoptimized={true}
                                            />
                                            
                                            {/* Main Image Badge on Thumbnail */}
                                            {img.isMain && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] font-medium py-1 text-center flex items-center justify-center gap-1">
                                                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                                    <span>MAIN</span>
                                                </div>
                                            )}
                                            
                                            {/* Selection Overlay */}
                                            {selectedImage === img.url && (
                                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-full">
                                                        Selected
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Single Image Info */}
                    {!hasMultipleImages && (
                        <div className="mt-4 text-center">
                            <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-gray-600">Single Image</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Image Counter */}
                    {hasMultipleImages && (
                        <div className="mt-3 text-center">
                            <p className="text-xs text-gray-400">
                                Showing {gallery.findIndex(img => img.url === selectedImage) + 1} of {gallery.length} images
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT: PRODUCT INFO */}
                <div className="flex flex-col justify-center space-y-5">
                    <h1 className="text-3xl font-semibold">{product.name}</h1>
                    <p className="text-2xl font-medium text-gray-800">
                        ${product.price}
                    </p>

                    {/* Stock Status */}
                    <div className="my-2">
                        <StockStatusBadge stock={product.stock} />
                    </div>

                    <p className="text-gray-600 leading-relaxed">
                        {product.description || "High-quality premium NFC/QR smart keychain."}
                    </p>

                    <p className="text-sm text-gray-500">
                        <strong>Brand:</strong> {product.brand || "Sardar IT"} &nbsp;|&nbsp;
                        <strong>Category:</strong> {product.category}
                    </p>

                    {/* customize quotes box here */}
                    <div className="">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Choose Your Message
                        </h2>

                        <div className="space-y-4">
                            {/* Option 1: Purchase for yourself */}
                            <button
                                onClick={() => setSelectedOption('yourself')}
                                className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                                    selectedOption === 'yourself'
                                        ? 'border-gray-900 bg-gray-50'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                            selectedOption === 'yourself'
                                                ? 'border-gray-900'
                                                : 'border-gray-300'
                                        }`}>
                                            {selectedOption === 'yourself' && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-gray-900"></div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            Purchase for yourself
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            We'll select a beautiful quote from our collection
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* Option 2: Purchase for Gift */}
                            <button
                                onClick={() => setSelectedOption('gift')}
                                className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                                    selectedOption === 'gift'
                                        ? 'border-gray-900 bg-gray-900'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                            selectedOption === 'gift'
                                                ? 'border-white'
                                                : 'border-gray-300'
                                        }`}>
                                            {selectedOption === 'gift' && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className={`font-semibold mb-1 ${
                                            selectedOption === 'gift' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            Purchase for Gift
                                        </h3>
                                        <p className={`text-sm ${
                                            selectedOption === 'gift' ? 'text-gray-300' : 'text-gray-500'
                                        }`}>
                                            Personalize with your own words
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* Text Area - Only show when "gift" is selected */}
                            {selectedOption === 'gift' && (
                                <div className="animate-fadeIn">
                                    <textarea
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        placeholder="Write something meaningful..."
                                        rows={4}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors resize-none text-gray-900 placeholder:text-gray-400"
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
                            >
                                <Minus size={16} />
                            </button>
                            <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                                disabled={quantity >= product.stock || product.stock <= 0}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                            disabled={isSaving}
                            className={`px-4 py-3 border rounded-md flex items-center gap-2 transition cursor-pointer ${
                                isFavorite
                                    ? "bg-red-500 text-white border-red-500"
                                    : "border-gray-700 hover:bg-gray-700 hover:text-white"
                            }`}
                        >
                            <Heart size={18} className={isFavorite ? "fill-white" : ""} />
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