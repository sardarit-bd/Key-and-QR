import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Mail, Image as ImageIcon, Upload, Trash2, Repeat, X } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import CategorySelect from "./CategorySelect";

export default function EditQuoteModal({ isOpen, onClose, quote, onSuccess }) {
    const { user } = useAuthStore();
    const [text, setText] = useState("");
    const [category, setCategory] = useState("");
    const [author, setAuthor] = useState("");
    const [theme, setTheme] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [allowReuse, setAllowReuse] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const getProviderInfo = () => {
        if (user?.provider === "google") {
            return { icon: <FaGoogle size={12} className="text-blue-500" />, text: "Google" };
        }
        return { icon: <Mail size={12} className="text-gray-500" />, text: "Email" };
    };

    const providerInfo = getProviderInfo();

    useEffect(() => {
        if (quote) {
            setText(quote.text);
            setCategory(quote.category);
            setAuthor(quote.author || "");
            setTheme(quote.theme || "");
            setDescription(quote.description || "");
            setIsActive(quote.isActive);
            setAllowReuse(quote.allowReuse !== undefined ? quote.allowReuse : true);
            if (quote.image?.url) {
                setExistingImage(quote.image);
                setImagePreview(quote.image.url);
            }
        }
    }, [quote]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error("Please select an image file");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image must be less than 5MB");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setExistingImage(null);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setExistingImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!text.trim()) {
            setError("Quote text is required");
            return;
        }

        setLoading(true);
        setError("");
        
        const formData = new FormData();
        formData.append("text", text.trim());
        formData.append("category", category);
        if (author.trim()) formData.append("author", author.trim());
        if (theme.trim()) formData.append("theme", theme.trim());
        if (description.trim()) formData.append("description", description.trim());
        formData.append("isActive", isActive);
        formData.append("allowReuse", allowReuse);
        if (imageFile) formData.append("image", imageFile);

        try {
            await api.patch(`/quotes/${quote._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Quote updated successfully");
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Update quote error:", err);
            setError(err.response?.data?.message || "Failed to update quote");
            toast.error(err.response?.data?.message || "Failed to update quote");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !quote) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Edit Quote</h3>
                            <p className="text-sm text-gray-500 mt-1">Update quote details including image and theme</p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            {providerInfo.icon}
                            <span className="text-gray-600">{providerInfo.text} Admin</span>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 space-y-5">
                    {/* Quote Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quote Text *
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
                            placeholder="Enter quote text..."
                        />
                    </div>
                    
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <CategorySelect value={category} onChange={setCategory} />
                    </div>

                    {/* Author */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Author
                        </label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="e.g., Rumi, Confucius"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    {/* Theme */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Theme (UI Customization)
                        </label>
                        <input
                            type="text"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            placeholder="e.g., sunset, nature, minimalist"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            placeholder="Additional context or meaning of the quote"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 resize-none"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quote Image
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition">
                            {imagePreview ? (
                                <div className="relative">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="max-h-48 rounded-lg object-contain"
                                    />
                                    <button
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                        >
                                            <Upload size={16} />
                                            Upload Image
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        PNG, JPG, GIF up to 5MB
                                    </p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </div>
                    </div>
                    
                    {/* Active Status & Allow Reuse */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="isActive" className="text-sm text-gray-700 select-none cursor-pointer">
                                Active (visible for scans)
                            </label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="allowReuse"
                                checked={allowReuse}
                                onChange={(e) => setAllowReuse(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="allowReuse" className="text-sm text-gray-700 select-none cursor-pointer">
                                Allow Reuse (if disabled, won't repeat for same user within a day)
                            </label>
                        </div>
                    </div>
                    
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}
                </div>
                
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !text.trim()}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}