import { useAuthStore } from "@/store/authStore";
import { Mail, X, Image as ImageIcon, Upload, Trash2, Repeat, Info } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

const CATEGORIES = [
    { value: "faith", label: "Faith", color: "bg-purple-100 text-purple-700" },
    { value: "love", label: "Love", color: "bg-pink-100 text-pink-700" },
    { value: "hope", label: "Hope", color: "bg-green-100 text-green-700" },
    { value: "success", label: "Success", color: "bg-blue-100 text-blue-700" },
    { value: "motivation", label: "Motivation", color: "bg-orange-100 text-orange-700" },
];

export default function CreateQuoteModal({ isOpen, onClose, onSuccess }) {
    const { user } = useAuthStore();
    const [text, setText] = useState("");
    const [category, setCategory] = useState("motivation");
    const [author, setAuthor] = useState("");
    const [theme, setTheme] = useState("");
    const [description, setDescription] = useState("");
    const [allowReuse, setAllowReuse] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
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

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Please select an image file");
                return;
            }
            
            // Validate file size (max 5MB)
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
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
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
        if (text.length < 3) {
            setError("Quote must be at least 3 characters");
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
        formData.append("allowReuse", allowReuse);
        if (imageFile) formData.append("image", imageFile);

        try {
            await api.post("/quotes", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Quote created successfully");
            // Reset form
            setText("");
            setCategory("motivation");
            setAuthor("");
            setTheme("");
            setDescription("");
            setAllowReuse(true);
            handleRemoveImage();
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Create quote error:", err);
            setError(err.response?.data?.message || "Failed to create quote");
            toast.error(err.response?.data?.message || "Failed to create quote");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Create New Quote</h3>
                            <p className="text-sm text-gray-500 mt-1">Add an inspirational quote with image and theme</p>
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
                            placeholder="Enter your quote here..."
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            {text.length}/1000 characters
                        </p>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
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
                            placeholder="e.g., Rumi, Confucius, InspireTag"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Leave empty for default "InspireTag"
                        </p>
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
                        <p className="text-xs text-gray-400 mt-1">
                            Used for UI styling on the frontend
                        </p>
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
                        <p className="text-xs text-gray-400 mt-1">
                            Optional metadata (max 1000 chars)
                        </p>
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

                    {/* Allow Reuse Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <Repeat size={20} className={allowReuse ? "text-blue-500" : "text-gray-400"} />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Allow Reuse</p>
                                <p className="text-xs text-gray-500">
                                    {allowReuse 
                                        ? "Quote can be shown multiple times to the same user" 
                                        : "Quote will not repeat for the same user within a day"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAllowReuse(!allowReuse)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                                allowReuse ? "bg-blue-600" : "bg-gray-300"
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                    allowReuse ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>

                    {/* Info Box */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                            <Info size={16} className="text-blue-500 mt-0.5" />
                            <div className="text-xs text-blue-700">
                                <p className="font-medium mb-1">Quote System Features:</p>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Images are uploaded to Cloudinary automatically</li>
                                    <li>Themes help with UI customization on the frontend</li>
                                    <li>Disable reuse to ensure users see fresh content</li>
                                    <li>All fields except text and category are optional</li>
                                </ul>
                            </div>
                        </div>
                    </div>

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
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating...
                            </>
                        ) : (
                            "Create Quote"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}