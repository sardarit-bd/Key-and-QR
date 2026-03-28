import { Heart, Sparkles, Star, Flame, Smile, RefreshCw, Copy, Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const CATEGORY_ICONS = {
    faith: Sparkles,
    love: Heart,
    hope: Smile,
    success: Star,
    motivation: Flame,
    personal: Heart,
};

const CATEGORY_COLORS = {
    faith: "from-purple-500 to-indigo-500",
    love: "from-pink-500 to-rose-500",
    hope: "from-green-500 to-emerald-500",
    success: "from-blue-500 to-cyan-500",
    motivation: "from-orange-500 to-red-500",
    personal: "from-indigo-500 to-purple-500",
};

export default function MessageDisplay({
    message,
    category,
    isPersonalMessage,
    remaining,
    dailyLimit,
    isAlreadyScanned
}) {
    const [copied, setCopied] = useState(false);
    const Icon = CATEGORY_ICONS[category] || Sparkles;
    const gradient = CATEGORY_COLORS[category] || "from-gray-500 to-gray-600";

    const handleCopy = () => {
        if (message) {
            navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const categoryName = {
        faith: "Faith", love: "Love", hope: "Hope",
        success: "Success", motivation: "Motivation", personal: "Personal"
    }[category] || "Inspiration";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
                {/* Header gradient */}
                <div className={`bg-gradient-to-r ${gradient} p-6 text-center`}>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                        <Icon size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                        {isAlreadyScanned ? "Your Message" : categoryName}
                    </h2>
                    <p className="text-white/80 text-sm">
                        {isAlreadyScanned
                            ? "You already unlocked this today"
                            : isPersonalMessage
                                ? "Your Personal Message"
                                : "Today's Inspiration"}
                    </p>
                </div>

                {/* Message content */}
                <div className="p-8">
                    <div className="relative mb-6">
                        <div className="absolute -top-2 -left-2 text-4xl text-gray-200">"</div>
                        <p className="text-xl md:text-2xl text-gray-800 italic leading-relaxed px-4 py-2">
                            {message}
                        </p>
                        <div className="absolute -bottom-2 -right-2 text-4xl text-gray-200">"</div>
                    </div>

                    {/* Copy button */}
                    <div className="flex justify-center mb-6">
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            {copied ? (
                                <>
                                    <Check size={16} className="text-green-600" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy size={16} />
                                    Copy Message
                                </>
                            )}
                        </button>
                    </div>

                    {/* Remaining scans info */}
                    {remaining !== null && remaining !== undefined && dailyLimit && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Remaining unlocks today:</span>
                                <span className="font-semibold text-gray-900">{remaining} / {dailyLimit}</span>
                            </div>
                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                    style={{ width: `${(remaining / dailyLimit) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Already scanned message */}
                    {isAlreadyScanned && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-yellow-800 text-center">
                                ✨ You've already unlocked a message today. Come back tomorrow for a new one!
                            </p>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        {!isAlreadyScanned && remaining > 0 && (
                            <Link
                                href="/"
                                className="flex-1 text-center py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition"
                            >
                                Get Another Message
                            </Link>
                        )}
                        <Link
                            href="/"
                            className="flex-1 text-center py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 text-center text-xs text-gray-500 border-t border-gray-100">
                    <p>Scan again tomorrow for a new message</p>
                </div>
            </div>
        </div>
    );
}