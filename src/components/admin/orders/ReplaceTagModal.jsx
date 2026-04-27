// components/admin/orders/ReplaceTagModal.jsx
import { useState, useEffect } from "react";
import { X, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import CustomSelect from "@/shared/CustomSelect";

export default function ReplaceTagModal({
    isOpen,
    onClose,
    orderId,
    oldTagId,
    oldTagCode,
    availableTags,
    onReplace,
    processing
}) {
    const [selectedNewTag, setSelectedNewTag] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setSelectedNewTag("");
        }
    }, [isOpen]);

    const tagOptions = availableTags
        .filter(tag => tag._id !== oldTagId)
        .map(tag => ({
            value: tag._id,
            label: tag.tagCode
        }));

    const handleSubmit = () => {
        if (!selectedNewTag) {
            toast.error("Please select a new tag");
            return;
        }
        onReplace(orderId, oldTagId, oldTagCode, selectedNewTag);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <RefreshCw size={20} className="text-green-500" />
                            <h3 className="text-lg font-semibold text-gray-900">Replace Tag</h3>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                            disabled={processing}
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Order: #{orderId?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                        Replacing tag: <span className="font-mono font-semibold text-blue-600">{oldTagCode}</span>
                    </p>
                </div>

                <div className="p-6">
                    <CustomSelect
                        label="Select New Tag"
                        options={tagOptions}
                        value={selectedNewTag}
                        onChange={setSelectedNewTag}
                        placeholder="Choose a tag to replace with..."
                        searchable={true}
                        clearable={true}
                    />
                    
                    {availableTags.length === 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-700">
                                No available tags to replace with. Please create more tags.
                            </p>
                        </div>
                    )}
                    
                    {tagOptions.length === 0 && availableTags.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-700">
                                No other tags available. This tag is the only unused tag.
                            </p>
                        </div>
                    )}
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
                        disabled={processing || !selectedNewTag || tagOptions.length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {processing ? (
                            <>
                                <Loader2 size={16} className="inline animate-spin mr-1" />
                                Replacing...
                            </>
                        ) : (
                            "Replace Tag"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}