import api from "@/lib/api";
import { useState } from "react";
import { toast } from "react-hot-toast";

const CATEGORIES = [
    { value: "faith", label: "Faith", color: "bg-purple-100 text-purple-700" },
    { value: "love", label: "Love", color: "bg-pink-100 text-pink-700" },
    { value: "hope", label: "Hope", color: "bg-green-100 text-green-700" },
    { value: "success", label: "Success", color: "bg-blue-100 text-blue-700" },
    { value: "motivation", label: "Motivation", color: "bg-orange-100 text-orange-700" },
];

export default function CreateQuoteModal({ isOpen, onClose, onSuccess }) {
    const [text, setText] = useState("");
    const [category, setCategory] = useState("motivation");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
        try {
            await api.post("/quotes", { text: text.trim(), category });
            toast.success("Quote created successfully");
            onSuccess();
            onClose();
            setText("");
            setCategory("motivation");
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
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Create New Quote</h3>
                    <p className="text-sm text-gray-500 mt-1">Add a new inspirational quote</p>
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
                            className="w-full px-3 py-2 border border-gray-300 outline-0 rounded-lg focus:ring-1 focus:ring-black/30 focus:ring-offset-2 focus:ring-offset-white transition resize-none"
                            placeholder="Enter your quote here..."
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
                        {loading ? "Creating..." : "Create Quote"}
                    </button>
                </div>
            </div>
        </div>
    );
}