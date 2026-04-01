// components/admin/orders/ProcessReturnModal.js
import { useAuthStore } from "@/store/authStore";
import { CheckCircle, Mail, Package, Truck, Undo2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FaGoogle } from "react-icons/fa";

export default function ProcessReturnModal({ isOpen, onClose, order, onConfirm, onCompleteReturn, processing }) {
    const [action, setAction] = useState("approve");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [rejectReason, setRejectReason] = useState("");
    const { user } = useAuthStore();

    const getProviderInfo = () => {
        if (user?.provider === "google") {
            return { icon: <FaGoogle size={12} className="text-blue-500" />, text: "Google" };
        }
        return { icon: <Mail size={12} className="text-gray-500" />, text: "Email" };
    };

    const providerInfo = getProviderInfo();

    if (!isOpen || !order) return null;

    const handleSubmit = () => {
        if (action === "reject" && !rejectReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }
        onConfirm(order._id, action === "approve", action === "approve" ? trackingNumber : null, action === "reject" ? rejectReason : null);
    };

    const isReturnShipped = order.returnStatus === "shipped";

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Undo2 size={24} className="text-orange-500" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                {isReturnShipped ? "Complete Return" : "Process Return Request"}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            {providerInfo.icon}
                            <span className="text-gray-600">{providerInfo.text} Admin</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Order: #{order._id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                        Customer: {order.user?.name || order.user?.email}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Return Reason: {order.returnReason || "Not specified"}
                    </p>
                    {order.returnTrackingNumber && (
                        <p className="text-sm text-gray-500">
                            Tracking: {order.returnTrackingNumber}
                        </p>
                    )}
                </div>

                {!isReturnShipped ? (
                    <div className="p-6">
                        <div className="flex gap-3 mb-4">
                            <button
                                onClick={() => setAction("approve")}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${action === "approve"
                                    ? "border-green-500 bg-green-50 text-green-700"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <CheckCircle size={18} />
                                Approve Return
                            </button>
                            <button
                                onClick={() => setAction("reject")}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${action === "reject"
                                    ? "border-red-500 bg-red-50 text-red-700"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                <XCircle size={18} />
                                Reject Return
                            </button>
                        </div>

                        {action === "approve" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Return Tracking Number (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter tracking number..."
                                />
                                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-sm text-yellow-700">
                                        ⚠️ Customer will need to ship the item back. Mark as received when item arrives.
                                    </p>
                                </div>
                            </div>
                        )}

                        {action === "reject" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rejection Reason *
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Enter reason for rejection..."
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Truck size={18} className="text-blue-600" />
                                <p className="font-medium text-blue-800">Return Shipped</p>
                            </div>
                            <p className="text-sm text-blue-700">
                                Tracking Number: {order.returnTrackingNumber || "N/A"}
                            </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Package size={18} className="text-green-600" />
                                <p className="font-medium text-green-800">Confirm Receipt</p>
                            </div>
                            <p className="text-sm text-green-700">
                                Mark this return as completed when you receive the returned item.
                                This will process the refund automatically.
                            </p>
                        </div>
                    </div>
                )}

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    {!isReturnShipped ? (
                        <button
                            onClick={handleSubmit}
                            disabled={processing || (action === "reject" && !rejectReason.trim())}
                            className={`px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${action === "approve"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                                }`}
                        >
                            {processing ? "Processing..." : action === "approve" ? "Approve Return" : "Reject Request"}
                        </button>
                    ) : (
                        <button
                            onClick={() => onCompleteReturn(order._id)}
                            disabled={processing}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {processing ? "Processing..." : "Mark as Received & Refund"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}