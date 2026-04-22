import { useState } from "react";
import { Trash2, X } from "lucide-react";

const DeleteModal = ({ isOpen, onClose, quote, onConfirm }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen || !quote) return null;

    const handleSubmit = async () => {
        setError("");
        setLoading(true);
        try {
            await onConfirm(quote._id);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete quote");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
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
                            <Trash2 size={20} className="text-red-600" />
                            Delete Quote Request
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
                    <p className="text-gray-600">Are you sure you want to delete this pending quote?</p>
                    <p className="text-sm text-gray-500 mt-2 italic">"{quote.text?.substring(0, 100)}..."</p>
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
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Delete Permanently
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;