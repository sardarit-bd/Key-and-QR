import { X, User, Mail, Calendar, Tag, MessageSquare, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { FaGoogle } from "react-icons/fa";
import { Mail as MailIcon } from "lucide-react";

const CATEGORY_COLORS = {
    faith: "bg-purple-100 text-purple-700",
    love: "bg-pink-100 text-pink-700",
    hope: "bg-green-100 text-green-700",
    success: "bg-blue-100 text-blue-700",
    motivation: "bg-orange-100 text-orange-700",
    other: "bg-gray-100 text-gray-700",
};

const CATEGORY_LABELS = {
    faith: "Faith",
    love: "Love",
    hope: "Hope",
    success: "Success",
    motivation: "Motivation",
    other: "Other",
};

const getStatusBadge = (status) => {
    switch (status) {
        case "approved":
            return {
                icon: <CheckCircle size={12} />,
                text: "Approved",
                color: "bg-green-100 text-green-700",
            };
        case "rejected":
            return {
                icon: <XCircle size={12} />,
                text: "Rejected",
                color: "bg-red-100 text-red-700",
            };
        default:
            return {
                icon: <Clock size={12} />,
                text: "Pending",
                color: "bg-yellow-100 text-yellow-700",
            };
    }
};

export default function QuoteDetailsModal({ isOpen, onClose, quote }) {
    const { user } = useAuthStore();

    const getProviderInfo = () => {
        if (quote?.user?.provider === "google") {
            return { icon: <FaGoogle size={12} className="text-blue-500" />, text: "Google" };
        }
        return { icon: <MailIcon size={12} className="text-gray-500" />, text: "Email" };
    };

    const providerInfo = getProviderInfo();
    const statusBadge = getStatusBadge(quote?.status);

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!isOpen || !quote) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-semibold text-gray-900">Quote Details</h3>
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                    {providerInfo.icon}
                                    <span className="text-gray-600">{providerInfo.text}</span>
                                </div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusBadge.color}`}>
                                    {statusBadge.icon}
                                    {statusBadge.text}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                ID: {quote._id?.slice(-8).toUpperCase()}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        >
                            <X size={20} className="text-gray-400 hover:text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Quote Text */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-50 rounded-xl p-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquare size={18} className="text-purple-500" />
                            <span className="text-sm font-medium text-gray-700">Quote Text</span>
                        </div>
                        <p className="text-gray-800 text-lg italic leading-relaxed">
                            "{quote.text}"
                        </p>
                    </div>

                    {/* Admin Note Section - Show if exists */}
                    {quote.adminNote && (
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText size={18} className="text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Admin Note</span>
                            </div>
                            <p className="text-blue-900 text-sm leading-relaxed">
                                {quote.adminNote}
                            </p>
                            {quote.approvedAt && (
                                <p className="text-xs text-blue-600 mt-2">
                                    Processed on: {formatDate(quote.approvedAt)}
                                </p>
                            )}
                            {quote.rejectedAt && (
                                <p className="text-xs text-blue-600 mt-2">
                                    Processed on: {formatDate(quote.rejectedAt)}
                                </p>
                            )}
                        </div>
                    )}

                    {/* User Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <User size={16} className="text-blue-500" />
                            Submitted By
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <User size={14} />
                                    Name
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {quote.user?.name || "Unknown User"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Mail size={14} />
                                    Email
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {quote.user?.email || "No email"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Calendar size={14} />
                                    Submitted At
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {formatDate(quote.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quote Metadata */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Tag size={16} className="text-green-500" />
                            Quote Metadata
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                <span className="text-sm text-gray-500">Category</span>
                                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${CATEGORY_COLORS[quote.category] || "bg-gray-100 text-gray-700"}`}>
                                    {CATEGORY_LABELS[quote.category] || quote.category}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusBadge.color}`}>
                                    {statusBadge.icon}
                                    {statusBadge.text}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Preview Section - Only show for pending quotes */}
                    {quote.status === "pending" && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <CheckCircle size={16} className="text-blue-600" />
                                Preview (After Approval)
                            </h4>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MessageSquare size={14} className="text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium text-gray-500">
                                                {quote.user?.name || "Anonymous"}
                                            </span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[quote.category] || "bg-gray-100 text-gray-700"}`}>
                                                {CATEGORY_LABELS[quote.category] || quote.category}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 italic">
                                            "{quote.text}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3 text-center">
                                This is how the quote will appear to users after approval
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}