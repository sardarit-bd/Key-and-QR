
export default function AssignTagModal({
    isOpen,
    onClose,
    order,
    availableTags,
    selectedTag,
    setSelectedTag,
    onAssign,
    assigning
}) {
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Assign Tag</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Order: #{order._id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                        Customer: {order.user?.name || order.user?.email}
                    </p>
                </div>
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Available Tag
                    </label>
                    <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Choose a tag...</option>
                        {availableTags.map((tag) => (
                            <option key={tag._id} value={tag._id}>
                                {tag.tagCode}
                            </option>
                        ))}
                    </select>
                    {availableTags.length === 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-700">
                                No unused tags available. Please create more tags in the Tags Management page.
                            </p>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onAssign}
                        disabled={assigning || !selectedTag}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {assigning ? "Assigning..." : "Assign Tag"}
                    </button>
                </div>
            </div>
        </div>
    );
}