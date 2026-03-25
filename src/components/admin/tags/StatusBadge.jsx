import { Check, X, AlertCircle } from "lucide-react";

export default function StatusBadge({ tag }) {
    if (!tag.isActive) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                <X size={12} />
                Disabled
            </span>
        );
    }
    if (tag.isActivated) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                <Check size={12} />
                Activated
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            <AlertCircle size={12} />
            Pending
        </span>
    );
}