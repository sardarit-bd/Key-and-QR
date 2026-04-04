"use client";

import api from "@/lib/api";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    // Categories list (you can fetch from API or define here)
    const categories = [
        "Smart NFC Keychain",
        "Digital Keychain",
        "RFID Card",
        "Smart Tag",
        "Accessories",
        "Other"
    ];

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
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError("Please upload an image file");
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size should be less than 5MB");
                return;
            }
            
            setMainImage(file);
            setMainImagePreview(URL.createObjectURL(file));
            setError("");
        }
    };

    // Handle gallery images selection
    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];
        const invalidFiles = [];
        
        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                invalidFiles.push(file.name);
            } else if (file.size > 5 * 1024 * 1024) {
                invalidFiles.push(`${file.name} (>5MB)`);
            } else {
                validFiles.push(file);
            }
        });
        
        if (invalidFiles.length > 0) {
            setError(`Invalid files: ${invalidFiles.join(', ')}. Please upload image files less than 5MB.`);
        }
        
        if (validFiles.length > 0) {
            const newImages = [...galleryImages, ...validFiles];
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            
            setGalleryImages(newImages);
            setGalleryPreviews([...galleryPreviews, ...newPreviews]);
            setError("");
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
        document.getElementById("main-image-input").value = "";
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            // Validation
            if (!mainImage) {
                throw new Error("Main image is required");
            }

            if (!formData.name.trim()) {
                throw new Error("Product name is required");
            }

            if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
                throw new Error("Please enter a valid price");
            }

            if (!formData.category) {
                throw new Error("Category is required");
            }

            if (!formData.description.trim()) {
                throw new Error("Description is required");
            }

            const formDataToSend = new FormData();
            
            formDataToSend.append("name", formData.name.trim());
            formDataToSend.append("price", Number(formData.price));
            formDataToSend.append("category", formData.category);
            formDataToSend.append("brand", formData.brand.trim());
            formDataToSend.append("description", formData.description.trim());
            formDataToSend.append("stock", Number(formData.stock) || 0);
            formDataToSend.append("image", mainImage);
            
            // Add gallery images
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
                setSuccess("Product created successfully!");
                // Reset form after successful submission
                setTimeout(() => {
                    router.push("/dashboard/admin/products");
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to create product");
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const handleReset = () => {
        setFormData({
            name: "",
            price: "",
            category: "",
            brand: "",
            description: "",
            stock: 0,
        });
        
        if (mainImagePreview) {
            URL.revokeObjectURL(mainImagePreview);
        }
        galleryPreviews.forEach(preview => URL.revokeObjectURL(preview));
        
        setMainImage(null);
        setMainImagePreview("");
        setGalleryImages([]);
        setGalleryPreviews([]);
        setError("");
        setSuccess("");
        
        document.getElementById("main-image-input").value = "";
        document.getElementById("gallery-input").value = "";
    };

    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
            galleryPreviews.forEach(preview => URL.revokeObjectURL(preview));
        };
    }, [mainImagePreview, galleryPreviews]);

    return (
        <div className="flex-1 w-full p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/admin/products"
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-semibold text-gray-900">Add New Product</h1>
                    </div>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Reset Form
                    </button>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {success}
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="space-y-6">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                                placeholder="e.g., Premium NFC Smart Keychain"
                            />
                            <p className="text-xs text-gray-500 mt-1">A descriptive name for your product</p>
                        </div>

                        {/* Price and Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (USD) <span className="text-red-500">*</span>
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
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
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
                                    placeholder="Enter brand name (optional)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Stock Quantity
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    min="0"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                                        formData.stock <= 0 ? 'border-red-300 bg-red-50' : 
                                        formData.stock <= 2 ? 'border-orange-300 bg-orange-50' : 
                                        'border-gray-300'
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
                                        <span>⚠️</span> Only {formData.stock} left - Limited stock warning
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
                                Main Image <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-3">
                                <input
                                    id="main-image-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={handleMainImageChange}
                                    className="hidden"
                                />

                                {/* Image Preview */}
                                {mainImagePreview ? (
                                    <div className="relative inline-block">
                                        <div className="relative w-40 h-40">
                                            <img
                                                src={mainImagePreview}
                                                alt="Main product"
                                                className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeMainImage}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
                                                title="Remove image"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-green-600 mt-2">Main image selected</p>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById("main-image-input").click()}
                                        className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition group"
                                    >
                                        <Upload size={32} className="text-gray-400 group-hover:text-gray-500 mb-2" />
                                        <span className="text-sm text-gray-500">Click to upload main image</span>
                                        <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Gallery Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gallery Images
                            </label>
                            <div className="space-y-3">
                                <input
                                    id="gallery-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    multiple
                                    onChange={handleGalleryChange}
                                    className="hidden"
                                />

                                {/* Gallery Previews */}
                                {galleryPreviews.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 mb-2">
                                            Gallery Images ({galleryPreviews.length}):
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                                                        title="Remove image"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upload Button */}
                                <button
                                    type="button"
                                    onClick={() => document.getElementById("gallery-input").click()}
                                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition group"
                                >
                                    <Plus size={24} className="text-gray-400 group-hover:text-gray-500 mb-2" />
                                    <span className="text-sm text-gray-500">
                                        {galleryImages.length > 0 ? 'Add more images' : 'Add gallery images'}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1">
                                        You can select multiple images
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="8"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y"
                                placeholder="Detailed product description..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.description.length} characters
                            </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Link
                                href="/dashboard/admin/products"
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} />
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