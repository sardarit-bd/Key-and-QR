"use client";

import api from "@/services/api";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    // Track if main image is uploaded
    const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);

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
            setIsMainImageUploaded(true);
        }
    };

    const handleGalleryChange = (e) => {
        if (!isMainImageUploaded) {
            setError("Please upload main image first before adding gallery images");
            return;
        }

        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newImages = [...galleryImages, ...files];
            const newPreviews = files.map(file => URL.createObjectURL(file));

            setGalleryImages(newImages);
            setGalleryPreviews([...galleryPreviews, ...newPreviews]);
            setError(""); // Clear any previous error
        }
    };

    // Remove single gallery image
    const removeGalleryImage = (index) => {
        URL.revokeObjectURL(galleryPreviews[index]);

        const newImages = galleryImages.filter((_, i) => i !== index);
        const newPreviews = galleryPreviews.filter((_, i) => i !== index);

        setGalleryImages(newImages);
        setGalleryPreviews(newPreviews);
    };

    // Remove main image
    const removeMainImage = () => {
        if (mainImagePreview) {
            URL.revokeObjectURL(mainImagePreview);
        }
        setMainImage(null);
        setMainImagePreview("");
        setIsMainImageUploaded(false);

        // Clear gallery images as well since main image is removed
        setGalleryImages([]);
        setGalleryPreviews([]);

        document.getElementById("main-image-input").value = "";
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Validation
            if (!mainImage) {
                throw new Error("Main image is required");
            }

            if (isNaN(formData.price) || Number(formData.price) <= 0) {
                throw new Error("Please enter a valid price");
            }

            const formDataToSend = new FormData();

            formDataToSend.append("name", formData.name);
            formDataToSend.append("price", Number(formData.price));
            formDataToSend.append("category", formData.category);
            formDataToSend.append("brand", formData.brand);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("stock", Number(formData.stock) || 0);

            formDataToSend.append("image", mainImage);

            galleryImages.forEach((img) => {
                formDataToSend.append("gallery", img);
            });

            // Send to backend
            const response = await api.post("/products", formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                router.push("/dashboard/admin/products");
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to create product");
        } finally {
            setLoading(false);
        }
    };

    // Cleanup preview URLs on unmount
    useState(() => {
        return () => {
            if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
            galleryPreviews.forEach(preview => URL.revokeObjectURL(preview));
        };
    }, [mainImagePreview, galleryPreviews]);

    return (
        <div className="flex-1 w-full p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-900">Add New Product</h1>
                </div>

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

                        {/* Brand and Stock */}
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    placeholder="10"
                                />
                            </div>
                        </div>

                        {/* Main Image Upload */}
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

                                {!mainImagePreview ? (
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById("main-image-input").click()}
                                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition"
                                    >
                                        <Upload size={24} className="text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500">Click to upload main image</span>
                                    </button>
                                ) : (
                                    <div className="relative w-40 h-40">
                                        <img
                                            src={mainImagePreview}
                                            alt="Main product"
                                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeMainImage}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Gallery Images Upload - Disabled until main image is uploaded */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Gallery Images {!isMainImageUploaded && <span className="text-xs text-red-500 ml-2">(Upload main image first)</span>}
                                </label>
                            </div>

                            <div className="space-y-3">
                                <input
                                    id="gallery-input"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleGalleryChange}
                                    className="hidden"
                                    disabled={!isMainImageUploaded}
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isMainImageUploaded) {
                                            setError("Please upload main image first before adding gallery images");
                                            return;
                                        }
                                        document.getElementById("gallery-input").click();
                                    }}
                                    className={`w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition ${isMainImageUploaded
                                        ? 'border-gray-300 hover:border-gray-400 cursor-pointer'
                                        : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                                        }`}
                                >
                                    <Upload size={18} className={isMainImageUploaded ? "text-gray-400" : "text-gray-300"} />
                                    <span className={`text-sm ${isMainImageUploaded ? "text-gray-500" : "text-gray-400"}`}>
                                        {isMainImageUploaded ? 'Add gallery images' : 'Upload main image first'}
                                    </span>
                                </button>

                                {/* Gallery Previews */}
                                {galleryPreviews.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                        {galleryPreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Gallery ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
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
                                )}
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
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !mainImage}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Create Product
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