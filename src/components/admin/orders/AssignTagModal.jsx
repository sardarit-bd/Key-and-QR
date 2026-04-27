// components/admin/orders/AssignTagModal.jsx
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

    // Calculate assigned count correctly
    const getAssignedCount = () => {
        let count = 0;
        
        // Count from assignedTags array
        if (order?.assignedTags && Array.isArray(order.assignedTags)) {
            count += order.assignedTags.length;
        }
        
        // Also count from legacy assignedTag if exists and not already counted
        if (order?.assignedTag && !order?.assignedTags?.some(t => t.tag?._id === order.assignedTag?._id || t.tag === order.assignedTag)) {
            count += 1;
        }
        
        return count;
    };
    
    const assignedCount = getAssignedCount();
    const requiredCount = order?.quantity || 1;
    const remainingCount = Math.max(requiredCount - assignedCount, 0);
    const hasAnyTag = assignedCount > 0;
    const hasAllRequiredTags = assignedCount >= requiredCount;

    // Get existing tags for display
    const getExistingTags = () => {
        const tags = [];
        if (order?.assignedTags && Array.isArray(order.assignedTags)) {
            order.assignedTags.forEach(item => {
                if (item.tag?.tagCode) tags.push(item.tag.tagCode);
            });
        }
        if (order?.assignedTag && !tags.includes(order.assignedTag.tagCode)) {
            tags.push(order.assignedTag.tagCode);
        }
        return tags;
    };

    const existingTags = getExistingTags();

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
                    {/* Tag Assignment Progress */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            <div>
                                <div className="text-gray-500 text-xs">Required</div>
                                <div className="font-semibold text-gray-900">{requiredCount}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs">Assigned</div>
                                <div className={`font-semibold ${assignedCount >= requiredCount ? "text-green-600" : "text-blue-600"}`}>
                                    {assignedCount}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs">Remaining</div>
                                <div className="font-semibold text-orange-600">{remainingCount}</div>
                            </div>
                        </div>
                    </div>

                    {/* Show existing tags if any */}
                    {hasAnyTag && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm font-medium text-blue-800 mb-2">Assigned Tags:</div>
                            <div className="flex flex-wrap gap-2">
                                {existingTags.map((tagCode, idx) => (
                                    <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">
                                        {tagCode}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

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
                            
                            {hasAllRequiredTags && (
                                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-700">
                                        ✓ All required tags have been assigned for this order.
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
                        disabled={assigning || !selectedTag || loadingTags || remainingCount === 0 || hasAllRequiredTags}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {assigning ? "Assigning..." : remainingCount > 1 ? "Assign One More Tag" : "Assign Tag"}
                    </button>
                </div>
            </div>
        </div>
    );
}