import { useState } from "react";
import { XCircle, X } from "lucide-react";

const RejectModal = ({ isOpen, onClose, quote, onConfirm }) => {
    const [adminNote, setAdminNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen || !quote) return null;

    const handleSubmit = async () => {
        setError("");
        setLoading(true);
        try {
            await onConfirm(quote._id, adminNote);
            setAdminNote(""); // Reset textarea after successful submission
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reject quote");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setAdminNote("");
            setError("");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <XCircle size={20} className="text-red-600" />
                            Reject Quote
                        </h3>
                        <button
                            onClick={handleClose}
                            className="p-1 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            disabled={loading}
                        >
                            <X size={18} className="text-gray-400" />
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-3">Quote from {quote.user?.name}:</p>
                    <p className="text-gray-900 italic p-3 bg-gray-50 rounded-lg">"{quote.text}"</p>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rejection Reason (Optional)
                        </label>
                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={2}
                            disabled={loading}
                            className="w-full px-3 py-2 border border-gray-300 outline-0 rounded-lg focus:ring-1 focus:ring-black/30 focus:ring-offset-2 focus:ring-offset-white transition disabled:bg-gray-100"
                            placeholder="Why is this quote being rejected? (will be visible to user)"
                        />
                    </div>
                    {error && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Rejecting...
                            </>
                        ) : (
                            <>
                                <XCircle size={16} />
                                Reject Quote
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectModal;