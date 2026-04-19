"use client";

import { X, Calendar, User, Tag, Power, PowerOff, Quote as QuoteIcon } from "lucide-react";

export default function QuoteDetailsModal({ isOpen, onClose, quote, formatDate, getCategoryBadge }) {
    if (!isOpen || !quote) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <QuoteIcon size={20} className="text-purple-500" />
                        <h2 className="text-xl font-semibold text-gray-900">Quote Details</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Quote Text */}
                    <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-purple-800 text-lg italic text-center">
                            "{quote.text}"
                        </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Category */}
                        <div className="border border-gray-100 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Tag size={14} />
                                <span className="text-xs">Category</span>
                            </div>
                            <div>{getCategoryBadge(quote.category)}</div>
                        </div>

                        {/* Status */}
                        <div className="border border-gray-100 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                {quote.isActive ? <Power size={14} /> : <PowerOff size={14} />}
                                <span className="text-xs">Status</span>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                                quote.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}>
                                {quote.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>

                        {/* Created Date */}
                        <div className="border border-gray-100 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Calendar size={14} />
                                <span className="text-xs">Created Date</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                {formatDate(quote.createdAt)}
                            </p>
                        </div>

                        {/* Last Updated */}
                        {quote.updatedAt && quote.updatedAt !== quote.createdAt && (
                            <div className="border border-gray-100 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    <Calendar size={14} />
                                    <span className="text-xs">Last Updated</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                    {formatDate(quote.updatedAt)}
                                </p>
                            </div>
                        )}

                        {/* ID */}
                        <div className="border border-gray-100 rounded-lg p-3 md:col-span-2">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <User size={14} />
                                <span className="text-xs">Quote ID</span>
                            </div>
                            <p className="text-xs font-mono text-gray-500 break-all">
                                {quote._id}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200">
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