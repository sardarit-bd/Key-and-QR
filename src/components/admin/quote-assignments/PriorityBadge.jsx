import { Star } from "lucide-react";

export default function PriorityBadge({ priority }) {
    const getPriorityColor = (p) => {
        if (p >= 8) return "bg-red-100 text-red-700 border-red-200";
        if (p >= 5) return "bg-orange-100 text-orange-700 border-orange-200";
        if (p >= 3) return "bg-yellow-100 text-yellow-700 border-yellow-200";
        return "bg-gray-100 text-gray-600 border-gray-200";
    };

    const getPriorityLabel = (p) => {
        if (p >= 8) return "Highest";
        if (p >= 5) return "High";
        if (p >= 3) return "Medium";
        return "Low";
    };

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
            <Star size={10} />
            <span>{getPriorityLabel(priority)}</span>
            <span className="font-bold">({priority})</span>
        </div>
    );
}