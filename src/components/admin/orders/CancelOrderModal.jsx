import { useState } from "react";
import { XCircle, Ban, Mail } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";

export default function CancelOrderModal({ isOpen, onClose, order, onConfirm, processing }) {
    const [reason, setReason] = useState("");
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
        if (!reason.trim()) {
            toast.error("Please provide a cancellation reason");
            return;
        }
        onConfirm(order._id, reason);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Ban size={24} className="text-red-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
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
                </div>
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cancellation Reason *
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter reason for cancellation..."
                    />
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-700">
                            {order.paymentStatus === "paid"
                                ? "⚠️ This order has been paid. Cancelling will trigger an automatic refund."
                                : "⚠️ This order is pending payment. Cancelling will not charge the customer."}
                        </p>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={processing || !reason.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {processing ? "Processing..." : "Confirm Cancellation"}
                    </button>
                </div>
            </div>
        </div>
    );
}