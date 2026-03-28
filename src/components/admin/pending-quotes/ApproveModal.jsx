const { useState } = require("react");
import { CheckCircle } from 'lucide-react';

const ApproveModal = ({ isOpen, onClose, quote, onConfirm }) => {
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
                        <CheckCircle size={20} className="text-green-600" />
                        Approve Quote
                    </h3>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-3">Quote from {quote.user?.name}:</p>
                    <p className="text-gray-900 italic p-3 bg-gray-50 rounded-lg">"{quote.text}"</p>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Admin Note (Optional)
                        </label>
                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Add a note..."
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? "Approving..." : "Approve & Add to Quotes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApproveModal;