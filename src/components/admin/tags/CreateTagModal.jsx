// components/admin/tags/CreateTagModal.js
import { useState } from "react";
import { X, Sparkles, Edit, Copy, Check, DollarSign, Mail } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function CreateTagModal({ isOpen, onClose, onSuccess }) {
    const { user } = useAuthStore();
    const [tagCode, setTagCode] = useState("");
    const [subscriptionType, setSubscriptionType] = useState("free");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    const [mode, setMode] = useState("auto");
    const [copied, setCopied] = useState(false);

    // Get provider info
    const getProviderInfo = () => {
        if (user?.provider === "google") {
            return { icon: <FaGoogle size={12} className="text-blue-500" />, text: "Google" };
        }
        return { icon: <Mail size={12} className="text-gray-500" />, text: "Email" };
    };

    const providerInfo = getProviderInfo();

    const generateTagCode = () => {
        const prefixes = ["TAG", "KEY", "NFC", "QR", "TAGID"];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();

        const options = [
            `${randomPrefix}${randomNum}`,
            `${randomPrefix}${randomChars}`,
            `TAG-${randomNum}`,
            `KEY-${randomChars}`,
            `QR-${Date.now().toString().slice(-6)}`
        ];

        return options[Math.floor(Math.random() * options.length)];
    };

    const handleAutoGenerate = () => {
        const newCode = generateTagCode();
        setTagCode(newCode);
    };

    const handleCopy = () => {
        if (tagCode) {
            navigator.clipboard.writeText(tagCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSubmit = async () => {
        if (!tagCode.trim()) {
            setError("Tag code is required");
            return;
        }

        const validRegex = /^[A-Za-z0-9_-]+$/;
        if (!validRegex.test(tagCode.trim())) {
            setError("Tag code can only contain letters, numbers, underscores, and hyphens");
            return;
        }

        if (tagCode.length < 3) {
            setError("Tag code must be at least 3 characters long");
            return;
        }

        try {
            setCreating(true);
            setError("");
            await api.post("/tags", {
                tagCode: tagCode.trim(),
                subscriptionType: subscriptionType
            });
            setTagCode("");
            setSubscriptionType("free");
            setMode("auto");
            onSuccess();
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || "Failed to create tag");
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-gray-900">Create New Tag</h2>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            {providerInfo.icon}
                            <span className="text-gray-500">{providerInfo.text} Admin</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Mode Selection Tabs */}
                    <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => {
                                setMode("auto");
                                setTagCode("");
                                setError("");
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer ${mode === "auto"
                                ? "bg-black text-white shadow"
                                : "text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <Sparkles size={16} />
                            Auto Generate
                        </button>
                        <button
                            onClick={() => {
                                setMode("manual");
                                setTagCode("");
                                setError("");
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer ${mode === "manual"
                                ? "bg-black text-white shadow"
                                : "text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <Edit size={16} />
                            Create Manually
                        </button>
                    </div>

                    {/* Subscription Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subscription Type
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setSubscriptionType("free")}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${subscriptionType === "free"
                                    ? "border-gray-900 bg-gray-900 text-white"
                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                Free
                            </button>
                            <button
                                type="button"
                                onClick={() => setSubscriptionType("subscriber")}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${subscriptionType === "subscriber"
                                    ? "border-purple-600 bg-purple-600 text-white"
                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <DollarSign size={14} />
                                Subscriber
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {subscriptionType === "subscriber"
                                ? "Subscribers can choose categories and get 3 unlocks per day"
                                : "Free users get 1 random quote per day"}
                        </p>
                    </div>

                    {/* Auto Generate Mode */}
                    {mode === "auto" && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                                <p className="text-sm text-gray-600 mb-3">
                                    Generate a unique tag code automatically. You can generate multiple times until you find one you like.
                                </p>
                                <button
                                    onClick={handleAutoGenerate}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                                >
                                    <Sparkles size={18} />
                                    Generate New Code
                                </button>
                            </div>

                            {tagCode && (
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Generated Tag Code
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tagCode}
                                            readOnly
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                                        />
                                        <button
                                            onClick={handleCopy}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                            title="Copy to clipboard"
                                        >
                                            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-500" />}
                                        </button>
                                    </div>
                                    {copied && (
                                        <p className="text-xs text-green-600">Copied to clipboard!</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Manual Create Mode */}
                    {mode === "manual" && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-sm text-gray-600 mb-3">
                                    Enter a custom tag code. Use letters, numbers, underscores, or hyphens.
                                </p>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tag Code
                                </label>
                                <input
                                    type="text"
                                    value={tagCode}
                                    onChange={(e) => setTagCode(e.target.value.toUpperCase())}
                                    placeholder="e.g., MY_TAG_001, CUSTOM-CODE, KEY123"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Tip: Use uppercase letters, numbers, underscores (_), or hyphens (-)
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Example Suggestions */}
                    {mode === "manual" && !tagCode && (
                        <div className="mt-4">
                            <p className="text-xs text-gray-500 mb-2">Examples:</p>
                            <div className="flex flex-wrap gap-2">
                                {["TAG_001", "KEYCHAIN-01", "NFC123", "QR_CODE_01", "CUSTOM_TAG"].map((example) => (
                                    <button
                                        key={example}
                                        onClick={() => setTagCode(example)}
                                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                                    >
                                        {example}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={handleSubmit}
                        disabled={creating || !tagCode.trim()}
                        className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                        {creating ? "Creating..." : `Create Tag${mode === "auto" ? " (Auto)" : ""}`}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>

                {/* Info Message */}
                <div className="px-6 pb-6">
                    <p className="text-xs text-gray-400 text-center">
                        {mode === "auto"
                            ? "Auto-generated codes are unique and ready to use"
                            : "Custom codes must be unique across all tags"}
                    </p>
                </div>
            </div>
        </div>
    );
}