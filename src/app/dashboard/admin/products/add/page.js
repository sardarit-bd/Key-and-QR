"use client";

import api from "@/services/api";
import { Plus, Upload, X } from "lucide-react";
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
        brand: "", // Default value
        image: "",
        gallery: [],
        description: "",
        stock: 10,
    });

    // For gallery images (temporary)
    const [galleryInput, setGalleryInput] = useState("");

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Add image to gallery
    const addToGallery = () => {
        if (galleryInput.trim()) {
            setFormData(prev => ({
                ...prev,
                gallery: [...prev.gallery, galleryInput.trim()]
            }));
            setGalleryInput("");
        }
    };

    // Remove image from gallery
    const removeFromGallery = (index) => {
        setFormData(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index)
        }));
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Validate price
            if (isNaN(formData.price) || Number(formData.price) <= 0) {
                throw new Error("Please enter a valid price");
            }

            // Prepare data
            const productData = {
                name: formData.name,
                price: Number(formData.price),
                category: formData.category,
                brand: formData.brand,
                image: formData.image,
                gallery: formData.gallery,
                description: formData.description,
                stock: Number(formData.stock) || 0,
            };

            // Send to backend
            const response = await api.post("/products", productData);

            if (response.data.success) {
                router.push("/dashboard/admin/products");
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to create product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 w-full p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Add New Product</h1>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Back
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
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
                                    Brand *
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    required
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

                        {/* Main Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Main Image URL *
                            </label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {/* Gallery Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gallery Images
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={galleryInput}
                                    onChange={(e) => setGalleryInput(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    placeholder="https://example.com/gallery-image.jpg"
                                />
                                <button
                                    type="button"
                                    onClick={addToGallery}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add
                                </button>
                            </div>

                            {/* Gallery Preview */}
                            {formData.gallery.length > 0 && (
                                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {formData.gallery.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={img}
                                                alt={`Gallery ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/150?text=Invalid+Image";
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFromGallery(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
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