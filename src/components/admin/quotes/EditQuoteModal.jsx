import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Mail } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

const CATEGORIES = [
    { value: "faith", label: "Faith", color: "bg-purple-100 text-purple-700" },
    { value: "love", label: "Love", color: "bg-pink-100 text-pink-700" },
    { value: "hope", label: "Hope", color: "bg-green-100 text-green-700" },
    { value: "success", label: "Success", color: "bg-blue-100 text-blue-700" },
    { value: "motivation", label: "Motivation", color: "bg-orange-100 text-orange-700" },
];

export default function EditQuoteModal({ isOpen, onClose, quote, onSuccess }) {
    const { user } = useAuthStore();
    const [text, setText] = useState("");
    const [category, setCategory] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
            setIsActive(quote.isActive);
        }
    }, [quote]);

    const handleSubmit = async () => {
        if (!text.trim()) {
            setError("Quote text is required");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await api.patch(`/quotes/${quote._id}`, { text: text.trim(), category, isActive });
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
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Edit Quote</h3>
                            <p className="text-sm text-gray-500 mt-1">Update your quote</p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            {providerInfo.icon}
                            <span className="text-gray-600">{providerInfo.text} Admin</span>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quote Text *
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />

                        <label
                            htmlFor="isActive"
                            className="text-sm text-gray-700 select-none cursor-pointer"
                        >
                            Active (visible for scans)
                        </label>
                    </div>
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
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