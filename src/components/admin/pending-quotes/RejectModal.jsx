const { XCircle } = require("lucide-react");
const { useState } = require("react");

const RejectModal = ({ isOpen, onClose, quote, onConfirm }) => {
    const [adminNote, setAdminNote] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen || !quote) return null;

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onConfirm(quote._id, adminNote);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <XCircle size={20} className="text-red-600" />
                        Reject Quote
                    </h3>
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
                            className="w-full px-3 py-2 border border-gray-300 outline-0 rounded-lg focus:ring-1 focus:ring-black/30 focus:ring-offset-2 focus:ring-offset-white transition"
                            placeholder="Why is this quote being rejected?"
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? "Rejecting..." : "Reject Quote"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectModal;