const DeleteConfirmModal = ({ isOpen, onClose, quote, onConfirm }) => {
    if (!isOpen || !quote) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Delete Quote</h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-600">
                        Are you sure you want to delete this quote?
                    </p>
                    <p className="text-sm text-gray-500 mt-2 font-mono">
                        "{quote.text?.substring(0, 100)}..."
                    </p>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(quote._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;