"use client";

import api from "@/services/api";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProductPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "",
        brand: "",
        description: "",
        stock: 0,
    });

    // File states
    const [mainImage, setMainImage] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState("");
    const [existingMainImage, setExistingMainImage] = useState(null);

    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [existingGallery, setExistingGallery] = useState([]);

    // Track images to remove
    const [imagesToRemove, setImagesToRemove] = useState([]);
    const [replaceGallery, setReplaceGallery] = useState(false);

    // Fetch product data on load
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setFetchLoading(true);
                const response = await api.get(`/products/${id}`);
                const product = response.data.data;

                // Set form data
                setFormData({
                    name: product.name || "",
                    price: product.price || "",
                    category: product.category || "",
                    brand: product.brand || "",
                    description: product.description || "",
                    stock: product.stock || 0,
                });

                // Set existing images
                if (product.image) {
                    setExistingMainImage(product.image);
                }

                if (product.gallery && product.gallery.length > 0) {
                    setExistingGallery(product.gallery);
                }

            } catch (err) {
                setError("Failed to load product");
                console.error(err);
            } finally {
                setFetchLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    // Handle text input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle main image selection
    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImage(file);
            setMainImagePreview(URL.createObjectURL(file));
        }
    };

    // Handle gallery images selection
    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newImages = [...galleryImages, ...files];
            const newPreviews = files.map(file => URL.createObjectURL(file));

            setGalleryImages(newImages);
            setGalleryPreviews([...galleryPreviews, ...newPreviews]);
        }
    };

    // Remove single gallery image (newly added)
    const removeGalleryImage = (index) => {
        URL.revokeObjectURL(galleryPreviews[index]);

        const newImages = galleryImages.filter((_, i) => i !== index);
        const newPreviews = galleryPreviews.filter((_, i) => i !== index);

        setGalleryImages(newImages);
        setGalleryPreviews(newPreviews);
    };

    // Remove existing gallery image
    const removeExistingGalleryImage = (index) => {
        const imageToRemove = existingGallery[index];
        setImagesToRemove(prev => [...prev, imageToRemove.public_id]);

        const newGallery = existingGallery.filter((_, i) => i !== index);
        setExistingGallery(newGallery);
    };

    // Remove main image
    const removeMainImage = () => {
        if (mainImagePreview) {
            URL.revokeObjectURL(mainImagePreview);
        }
        setMainImage(null);
        setMainImagePreview("");
        document.getElementById("main-image-input").value = "";
    };

    // Remove existing main image
    const removeExistingMainImage = () => {
        setImagesToRemove(prev => [...prev, existingMainImage.public_id]);
        setExistingMainImage(null);
    };

    // Handle replace all gallery
    const handleReplaceGallery = () => {
        setReplaceGallery(true);
        // Mark all existing gallery images for removal
        const allGalleryIds = existingGallery.map(img => img.public_id);
        setImagesToRemove(prev => [...prev, ...allGalleryIds]);
        setExistingGallery([]);
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            // Validation
            if (!existingMainImage && !mainImage) {
                throw new Error("Main image is required");
            }

            if (isNaN(formData.price) || Number(formData.price) <= 0) {
                throw new Error("Please enter a valid price");
            }

            // FormData তৈরি করুন
            const formDataToSend = new FormData();

            // Text fields যোগ করুন
            formDataToSend.append("name", formData.name);
            formDataToSend.append("price", Number(formData.price));
            formDataToSend.append("category", formData.category);
            formDataToSend.append("brand", formData.brand);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("stock", Number(formData.stock) || 0);

            // Add remove flags
            if (imagesToRemove.length > 0) {
                formDataToSend.append("removeGallery", JSON.stringify(imagesToRemove));
            }

            if (replaceGallery) {
                formDataToSend.append("replaceGallery", "true");
            }

            // New main image (if uploaded)
            if (mainImage) {
                formDataToSend.append("image", mainImage);
            }

            // New gallery images (if uploaded)
            galleryImages.forEach((img) => {
                formDataToSend.append("gallery", img);
            });

            // Send to backend
            const response = await api.patch(`/products/${id}`, formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                setSuccess("Product updated successfully!");
                setTimeout(() => {
                    router.push("/dashboard/admin/products");
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to update product");
        } finally {
            setLoading(false);
        }
    };

    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
            galleryPreviews.forEach(preview => URL.revokeObjectURL(preview));
        };
    }, [mainImagePreview, galleryPreviews]);

    if (fetchLoading) {
        return (
            <div className="flex-1 w-full p-4 lg:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/admin/products"
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
                        {success}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6" encType="multipart/form-data">
                    <div className="space-y-6">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                                placeholder="e.g. Digital Keychain"
                            />
                        </div>

                        {/* Price and Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (USD) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    placeholder="29.99"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    placeholder="e.g. Smart NFC Keychain"
                                />
                            </div>
                        </div>

                        {/* Brand and Stock with Visual Feedback */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Brand
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    placeholder="Enter your brand..."
                                />
                            </div>

                            {/* Stock Field with Visual Feedback */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Stock Quantity *
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    min="0"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${formData.stock <= 0
                                            ? 'border-red-300 bg-red-50'
                                            : formData.stock <= 2
                                                ? 'border-orange-300 bg-orange-50'
                                                : 'border-gray-300'
                                        }`}
                                    placeholder="10"
                                />
                                {formData.stock <= 0 && (
                                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                        <span>⚠️</span> Product will show as <span className="font-semibold">"Out of Stock"</span>
                                    </p>
                                )}
                                {formData.stock > 0 && formData.stock <= 2 && (
                                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                        <span>⚠️</span> Only {formData.stock} left - <span className="font-semibold">"Limited stock"</span> message will appear
                                    </p>
                                )}
                                {formData.stock > 2 && (
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <span>✓</span> In stock - Normal display
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Main Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Main Image *
                            </label>
                            <div className="space-y-3">
                                <input
                                    id="main-image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleMainImageChange}
                                    className="hidden"
                                />

                                {/* Existing Main Image */}
                                {existingMainImage && !mainImagePreview && (
                                    <div className="relative w-40 h-40">
                                        <img
                                            src={existingMainImage.url}
                                            alt="Current main"
                                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeExistingMainImage}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                            title="Remove image"
                                        >
                                            <X size={14} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
                                            Current
                                        </div>
                                    </div>
                                )}

                                {/* New Main Image Preview */}
                                {mainImagePreview && (
                                    <div className="relative w-40 h-40">
                                        <img
                                            src={mainImagePreview}
                                            alt="New main"
                                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeMainImage}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                        >
                                            <X size={14} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-green-500/80 text-white text-xs p-1 rounded-b-lg">
                                            New
                                        </div>
                                    </div>
                                )}

                                {/* Upload button - show if no existing and no new */}
                                {!existingMainImage && !mainImagePreview && (
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById("main-image-input").click()}
                                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition"
                                    >
                                        <Upload size={24} className="text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500">Click to upload main image</span>
                                    </button>
                                )}

                                {/* Change button - show if there is existing */}
                                {existingMainImage && !mainImagePreview && (
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById("main-image-input").click()}
                                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                    >
                                        Change Image
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Gallery Images */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Gallery Images
                                </label>
                                {existingGallery.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleReplaceGallery}
                                        className="text-sm text-red-600 hover:text-red-700 cursor-pointer"
                                    >
                                        Replace All
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                <input
                                    id="gallery-input"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleGalleryChange}
                                    className="hidden"
                                />

                                {/* Existing Gallery */}
                                {existingGallery.length > 0 && !replaceGallery && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 mb-2">Current Gallery Images:</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {existingGallery.map((img, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={img.url}
                                                        alt={`Gallery ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingGalleryImage(index)}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                                                        title="Remove image"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* New Gallery Previews */}
                                {galleryPreviews.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs text-green-600 mb-2">New Images to Add:</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {galleryPreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={preview}
                                                        alt={`New gallery ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border border-green-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryImage(index)}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Add More Button */}
                                <button
                                    type="button"
                                    onClick={() => document.getElementById("gallery-input").click()}
                                    className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:border-gray-400 transition"
                                >
                                    <Upload size={18} className="text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                        {galleryImages.length > 0 ? 'Add more images' : 'Add gallery images'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="6"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                                placeholder="Product description..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Link
                                href="/dashboard/admin/products"
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Update Product
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}