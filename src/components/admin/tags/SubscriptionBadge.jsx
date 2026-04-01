import { DollarSign } from "lucide-react";

export default function SubscriptionBadge({ type }) {
    if (type === "subscriber") {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                <DollarSign size={12} />
                Subscriber
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            Free
        </span>
    );
}