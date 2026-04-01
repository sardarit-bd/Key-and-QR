import { CheckCircle, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ProcessRefundModal({ isOpen, onClose, order, onConfirm, processing }) {
    const [action, setAction] = useState("approve");
    const [rejectReason, setRejectReason] = useState("");

    if (!isOpen || !order) return null;

    const handleSubmit = () => {
        if (action === "reject" && !rejectReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }
        onConfirm(order._id, action === "approve", action === "reject" ? rejectReason : null);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <RotateCcw size={24} className="text-purple-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Process Refund Request</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Order: #{order._id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                        Customer: {order.user?.name || order.user?.email}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Amount: ${order.product?.price?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-sm text-gray-500">
                        Refund Reason: {order.refundReason || "Not specified"}
                    </p>
                </div>
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
                            Approve Refund
                        </button>
                        <button
                            onClick={() => setAction("reject")}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${action === "reject"
                                    ? "border-red-500 bg-red-50 text-red-700"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <XCircle size={18} />
                            Reject Refund
                        </button>
                    </div>

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

                    {action === "approve" && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-700">
                                ✓ Refund will be processed via Stripe. The customer will receive the full amount.
                            </p>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={processing || (action === "reject" && !rejectReason.trim())}
                        className={`px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${action === "approve"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                    >
                        {processing ? "Processing..." : action === "approve" ? "Approve Refund" : "Reject Request"}
                    </button>
                </div>
            </div>
        </div>
    );
}