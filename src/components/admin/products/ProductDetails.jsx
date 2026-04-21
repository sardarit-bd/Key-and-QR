"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Edit, Trash2, Package, DollarSign, Tag, Layers, Calendar, Archive, Star, AlertCircle, Zap, BadgeCheck, X } from "lucide-react";
import api from "@/lib/api";
import Loader from "@/shared/Loader";
import { toast } from "react-hot-toast";

// Stock Status Component (same as shop page)
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
                <span>Only {stock} {stock === 1 ? 'item' : 'items'} left!</span>
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

export default function ProductDetails({ productId }) {
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");
    const [imageError, setImageError] = useState(false);
    const [isMainImageSelected, setIsMainImageSelected] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${productId}`);
            setProduct(response.data.data);
        } catch (error) {
            console.error("Error fetching product details:", error);
            setError(error.response?.data?.message || "Failed to load product details");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/products/${productId}`);
            toast.success("Product moved to trash successfully");
            setShowDeleteModal(false);
            router.push("/dashboard/admin/products");
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error(error.response?.data?.message || "Failed to move product to trash");
        } finally {
            setIsDeleting(false);
        }
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

    // Build gallery array for thumbnails with main image info
    const getGalleryImages = () => {
        const images = [];

        // Add main image with flag
        if (product?.image?.url) {
            images.push({
                url: product.image.url,
                isMain: true,
                label: "Main Image"
            });
        }

        // Add gallery images
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

    if (loading) {
        return <Loader text="Loading product details..." size={40} />;
    }

    if (error || !product) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{error || "Product not found"}</p>
                <Link
                    href="/dashboard/admin/products"
                    className="inline-flex items-center gap-2 mt-4 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={18} />
                    Back to Products
                </Link>
            </div>
        );
    }

    const gallery = getGalleryImages();
    const hasMultipleImages = gallery.length > 1;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
                <Link
                    href="/dashboard/admin/products"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                >
                    <ArrowLeft size={18} />
                    Back to Products
                </Link>
            </div>

            {/* Product Details Card - Same layout as shop page */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* LEFT: IMAGE GALLERY - Same as shop page */}
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
                                                className={`relative group transition-all duration-200 cursor-pointer ${selectedImage === img.url
                                                        ? "ring-2 ring-offset-2 ring-black scale-105"
                                                        : "hover:scale-105"
                                                    }`}
                                            >
                                                <div className={`relative border-2 rounded-lg overflow-hidden ${selectedImage === img.url
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

                        {/* RIGHT: PRODUCT INFO - Admin specific with edit/delete */}
                        <div className="flex flex-col justify-center space-y-5">
                            {/* Header with Admin Actions */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Product ID: {product._id}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/dashboard/admin/products/edit/${product._id}`}
                                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                    >
                                        <Archive size={16} />
                                        Move to Trash
                                    </button>
                                </div>
                            </div>

                            {/* Price */}
                            <p className="text-2xl font-medium text-gray-800">
                                ${product.price}
                                {product.compareAtPrice && (
                                    <span className="ml-2 text-sm text-gray-400 line-through">
                                        ${product.compareAtPrice}
                                    </span>
                                )}
                            </p>

                            {/* Stock Status */}
                            <div className="my-2">
                                <StockStatusBadge stock={product.stock} />
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 leading-relaxed">
                                {product.description || "No description available."}
                            </p>

                            {/* Product Info */}
                            <div className="space-y-2">
                                <p className="text-sm text-gray-500">
                                    <strong>Brand:</strong> {product.brand || "N/A"}
                                </p>
                                <p className="text-sm text-gray-500">
                                    <strong>Category:</strong> {product.category}
                                </p>
                            </div>

                            {/* Stock Warning */}
                            {product.stock <= 2 && product.stock > 0 && (
                                <p className="flex items-center gap-1 text-orange-600 text-sm font-medium animate-pulse">
                                    <Zap size={16} /> Hurry! Only {product.stock} {product.stock === 1 ? 'item' : 'items'} left in stock
                                </p>
                            )}

                            {/* Divider */}
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Product Information</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600">
                                        <span className="font-medium">Created:</span> {new Date(product.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Last Updated:</span> {new Date(product.updatedAt).toLocaleDateString()}
                                    </p>
                                    {product.deletedAt && (
                                        <p className="text-red-600">
                                            <span className="font-medium">Deleted:</span> {new Date(product.deletedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Admin Stats Cards */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Total Stock</p>
                                    <p className={`text-xl font-bold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                                        {product.stock}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Product Status</p>
                                    <p className={`text-sm font-medium ${product.isActive ? "text-green-600" : "text-red-600"}`}>
                                        {product.isActive ? "Active" : "Inactive"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <Archive size={24} className="text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Move to Trash
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-gray-700 mb-2">
                                    Are you sure you want to move <strong className="font-semibold">{product.name}</strong> to trash?
                                </p>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                                    <p className="text-sm text-yellow-700 flex items-start gap-2">
                                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                                        <span>
                                            This product will be moved to trash. You can restore it later from the trash section.
                                            All product data including images will be preserved.
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Product Summary */}
                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-3">
                                    {product.image?.url ? (
                                        <img
                                            src={product.image.url}
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <Package size={20} className="text-gray-400" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-900">{product.name}</p>
                                        <p className="text-sm text-gray-500">${product.price} · Stock: {product.stock}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Moving...
                                    </>
                                ) : (
                                    <>
                                        <Archive size={16} />
                                        Move to Trash
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}