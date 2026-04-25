"use client";

import { useState, useEffect } from "react";
import { X, Upload, Loader2, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

const CATEGORIES = [
    { value: "faith", label: "Faith", color: "bg-purple-100 text-purple-700" },
    { value: "love", label: "Love", color: "bg-red-100 text-pink-700" },
    { value: "hope", label: "Hope", color: "bg-green-100 text-green-700" },
    { value: "success", label: "Success", color: "bg-blue-100 text-blue-700" },
    { value: "motivation", label: "Motivation", color: "bg-orange-100 text-orange-700" },
];

export default function EditQuoteModal({ isOpen, onClose, quote, onSuccess }) {
    const [formData, setFormData] = useState({
        text: "",
        category: "motivation",
        author: "",
        description: "",
        theme: "",
        allowReuse: true,
        isActive: true,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (quote) {
            setFormData({
                text: quote.text || "",
                category: quote.category || "motivation",
                author: quote.author || "",
                description: quote.description || "",
                theme: quote.theme || "",
                allowReuse: quote.allowReuse !== undefined ? quote.allowReuse : true,
                isActive: quote.isActive !== undefined ? quote.isActive : true,
            });
            setCurrentImage(quote.image?.url || null);
            setImagePreview(null);
            setImageFile(null);
            setRemoveImage(false);
        }
    }, [quote]);

    if (!isOpen || !quote) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setRemoveImage(false);
        }
    };

    const handleRemoveImage = () => {
        setRemoveImage(true);
        setImageFile(null);
        setImagePreview(null);
        setCurrentImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("text", formData.text);
            formDataToSend.append("category", formData.category);
            if (formData.author) formDataToSend.append("author", formData.author);
            if (formData.description) formDataToSend.append("description", formData.description);
            if (formData.theme) formDataToSend.append("theme", formData.theme);
            formDataToSend.append("allowReuse", formData.allowReuse);
            formDataToSend.append("isActive", formData.isActive);
            if (imageFile) formDataToSend.append("image", imageFile);
            if (removeImage) formDataToSend.append("removeImage", "true");

            await api.patch(`/quotes/${quote._id}`, formDataToSend, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Quote updated successfully!");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update quote");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Quote</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Quote Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quote Text <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="text"
                            value={formData.text}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Author */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    {/* Theme */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Theme / Style</label>
                        <input
                            type="text"
                            name="theme"
                            value={formData.theme}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quote Image</label>
                        <div className="mt-1 flex items-center gap-4 flex-wrap">
                            {currentImage && !removeImage && !imagePreview && (
                                <div className="relative w-32 h-32">
                                    <img src={currentImage} alt="Current" className="w-full h-full object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            )}
                            {imagePreview && (
                                <div className="relative w-32 h-32">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload size={24} className="text-gray-400" />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {currentImage ? "Change" : "Upload"}
                                    </p>
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* Allow Reuse Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Allow Reuse</label>
                            <p className="text-xs text-gray-500">If disabled, this quote won't repeat within the same day</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, allowReuse: !prev.allowReuse }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                                formData.allowReuse ? "bg-green-600" : "bg-gray-300"
                            }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                formData.allowReuse ? "translate-x-6" : "translate-x-1"
                            }`} />
                        </button>
                    </div>

                    {/* Active Status Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Active Status</label>
                            <p className="text-xs text-gray-500">Inactive quotes won't be shown to users</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                                formData.isActive ? "bg-green-600" : "bg-gray-300"
                            }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                formData.isActive ? "translate-x-6" : "translate-x-1"
                            }`} />
                        </button>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.text.trim()}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}