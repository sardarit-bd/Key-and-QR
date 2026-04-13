import CustomSelect from "@/shared/CustomSelect";
import { useAuthStore } from "@/store/authStore";
import { Mail, Loader2 } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

export default function AssignTagModal({
    isOpen,
    onClose,
    order,
    availableTags,
    selectedTag,
    setSelectedTag,
    onAssign,
    assigning,
    loadingTags = false
}) {
    const { user } = useAuthStore();

    const getProviderInfo = () => {
        if (user?.provider === "google") {
            return { icon: <FaGoogle size={12} className="text-blue-500" />, text: "Google" };
        }
        return { icon: <Mail size={12} className="text-gray-500" />, text: "Email" };
    };

    const providerInfo = getProviderInfo();

    // Convert tags to options format for CustomSelect
    const tagOptions = availableTags.map(tag => ({
        value: tag._id,
        label: tag.tagCode
    }));

    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Assign Tag</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Order: #{order._id?.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-500">
                                Customer: {order.user?.name || order.user?.email}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            {providerInfo.icon}
                            <span className="text-gray-600">{providerInfo.text} Admin</span>
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                    {loadingTags ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={32} className="animate-spin text-blue-500" />
                            <span className="ml-2 text-gray-500">Loading tags...</span>
                        </div>
                    ) : (
                        <>
                            <CustomSelect
                                label="Select Available Tag"
                                options={tagOptions}
                                value={selectedTag}
                                onChange={setSelectedTag}
                                placeholder="Choose a tag..."
                                searchable={true}
                                clearable={true}
                            />
                            
                            {availableTags.length === 0 && (
                                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-sm text-yellow-700">
                                        No unused tags available. Please create more tags in the Tags Management page.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
                
                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        disabled={assigning}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onAssign}
                        disabled={assigning || !selectedTag || loadingTags}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {assigning ? "Assigning..." : "Assign Tag"}
                    </button>
                </div>
            </div>
        </div>
    );
}