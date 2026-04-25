import { X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export function UserRequestModal({ isOpen, onClose, onSubmit, title, description, submitText, loading }) {
    const [reason, setReason] = useState("");

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast.error("Please provide a reason");
            return;
        }
        onSubmit(reason);
        setReason("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
                
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for {title.toLowerCase()} *
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent resize-none"
                        placeholder={`Please describe why you want to ${title.toLowerCase()}...`}
                    />
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-700">
                            ⚠️ This request will be reviewed by our admin team. You will be notified once processed.
                        </p>
                    </div>
                </div>
                
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !reason.trim()}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? "Submitting..." : submitText}
                    </button>
                </div>
            </div>
        </div>
    );
}