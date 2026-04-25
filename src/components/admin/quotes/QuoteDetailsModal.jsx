"use client";

import { X, Calendar, User, Tag, Hash, RefreshCw, Power, PowerOff, Image as ImageIcon } from "lucide-react";

const CATEGORIES = {
    faith: { label: "Faith", color: "bg-purple-100 text-purple-700" },
    love: { label: "Love", color: "bg-red-100 text-pink-700" },
    hope: { label: "Hope", color: "bg-green-100 text-green-700" },
    success: { label: "Success", color: "bg-blue-100 text-blue-700" },
    motivation: { label: "Motivation", color: "bg-orange-100 text-orange-700" },
};

export default function QuoteDetailsModal({ isOpen, onClose, quote }) {
    if (!isOpen || !quote) return null;

    const categoryInfo = CATEGORIES[quote.category] || { label: quote.category, color: "bg-gray-100 text-gray-700" };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Quote Details</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Image */}
                    {quote.image?.url && (
                        <div className="rounded-lg overflow-hidden bg-gray-100">
                            <img
                                src={quote.image.url}
                                alt="Quote visual"
                                className="w-full h-64 object-cover"
                            />
                        </div>
                    )}

                    {/* Quote Text */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-lg text-gray-900 italic leading-relaxed">
                            "{quote.text}"
                        </p>
                        {quote.author && (
                            <p className="text-right text-gray-600 mt-2">— {quote.author}</p>
                        )}
                    </div>

                    {/* Meta Information Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Category */}
                        <div className="flex items-center gap-2 text-sm">
                            <Tag size={16} className="text-gray-400" />
                            <span className="text-gray-500">Category:</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${categoryInfo.color}`}>
                                {categoryInfo.label}
                            </span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2 text-sm">
                            {quote.isActive ? <Power size={16} className="text-green-500" /> : <PowerOff size={16} className="text-red-500" />}
                            <span className="text-gray-500">Status:</span>
                            <span className={quote.isActive ? "text-green-600" : "text-red-600"}>
                                {quote.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>

                        {/* Allow Reuse */}
                        <div className="flex items-center gap-2 text-sm">
                            <RefreshCw size={16} className="text-gray-400" />
                            <span className="text-gray-500">Allow Reuse:</span>
                            <span className={quote.allowReuse ? "text-green-600" : "text-orange-600"}>
                                {quote.allowReuse ? "Yes" : "No (Limited per day)"}
                            </span>
                        </div>

                        {/* Theme */}
                        {quote.theme && (
                            <div className="flex items-center gap-2 text-sm">
                                <Hash size={16} className="text-gray-400" />
                                <span className="text-gray-500">Theme:</span>
                                <span className="text-gray-900">{quote.theme}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {quote.description && (
                        <div className="border-t border-gray-100 pt-3">
                            <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                            <p className="text-sm text-gray-600">{quote.description}</p>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="border-t border-gray-100 pt-3 space-y-1 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                            <Calendar size={12} />
                            <span>Created: {new Date(quote.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={12} />
                            <span>Updated: {new Date(quote.updatedAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t border-gray-200">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}