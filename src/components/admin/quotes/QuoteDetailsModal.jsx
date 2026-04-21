"use client";

import { Calendar, User, Tag, Power, PowerOff, X, Quote } from "lucide-react";

export default function QuoteDetailsModal({ isOpen, onClose, quote }) {
    if (!isOpen || !quote) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getCategoryLabel = (category) => {
        const categories = {
            faith: "Faith",
            love: "Love",
            hope: "Hope",
            success: "Success",
            motivation: "Motivation"
        };
        return categories[category] || category;
    };

    const getCategoryColor = (category) => {
        const colors = {
            faith: "bg-purple-100 text-purple-700",
            love: "bg-red-100 text-pink-700",
            hope: "bg-green-100 text-green-700",
            success: "bg-blue-100 text-blue-700",
            motivation: "bg-orange-100 text-orange-700"
        };
        return colors[category] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Quote size={20} className="text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Quote Details</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer" 
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Quote Text */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 text-lg leading-relaxed italic">
                            "{quote.text}"
                        </p>
                        {quote.author && (
                            <p className="text-gray-500 text-sm mt-2 text-right">
                                — {quote.author}
                            </p>
                        )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Category */}
                        <div className="flex items-start gap-3">
                            <Tag size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Category</p>
                                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full mt-1 ${getCategoryColor(quote.category)}`}>
                                    {getCategoryLabel(quote.category)}
                                </span>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-start gap-3">
                            {quote.isActive ? (
                                <Power size={18} className="text-green-500 mt-0.5" />
                            ) : (
                                <PowerOff size={18} className="text-red-500 mt-0.5" />
                            )}
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full mt-1 ${
                                    quote.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}>
                                    {quote.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>

                        {/* Created Date */}
                        <div className="flex items-start gap-3">
                            <Calendar size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Created</p>
                                <p className="text-sm text-gray-700">{formatDate(quote.createdAt)}</p>
                            </div>
                        </div>

                        {/* Last Updated */}
                        <div className="flex items-start gap-3">
                            <Calendar size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Last Updated</p>
                                <p className="text-sm text-gray-700">{formatDate(quote.updatedAt)}</p>
                            </div>
                        </div>

                        {/* ID */}
                        <div className="flex items-start gap-3 md:col-span-2">
                            <User size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Quote ID</p>
                                <p className="text-sm font-mono text-gray-600 break-all">{quote._id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}