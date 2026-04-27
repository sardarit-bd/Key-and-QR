// components/admin/orders/ConfirmModal.jsx
import { X, AlertTriangle } from "lucide-react";

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "danger", // danger, warning, success
    processing = false
}) {
    if (!isOpen) return null;

    const getConfirmButtonClass = () => {
        switch (confirmVariant) {
            case "danger":
                return "bg-red-600 hover:bg-red-700";
            case "warning":
                return "bg-orange-600 hover:bg-orange-700";
            case "success":
                return "bg-green-600 hover:bg-green-700";
            default:
                return "bg-blue-600 hover:bg-blue-700";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${confirmVariant === "danger" ? "bg-red-100" : confirmVariant === "warning" ? "bg-orange-100" : "bg-blue-100"}`}>
                                <AlertTriangle size={20} className={`${confirmVariant === "danger" ? "text-red-600" : confirmVariant === "warning" ? "text-orange-600" : "text-blue-600"}`} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                            disabled={processing}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <p className="text-gray-600">{message}</p>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        disabled={processing}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={processing}
                        className={`px-4 py-2 text-white rounded-lg transition cursor-pointer ${getConfirmButtonClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {processing ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}