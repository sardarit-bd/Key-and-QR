import { Tag, Check, AlertCircle, Shield } from "lucide-react";

export default function StatsCards({ stats }) {
    const cards = [
        {
            label: "Total Tags",
            value: stats.total,
            icon: Tag,
            color: "text-gray-900",
            bgColor: "text-gray-400"
        },
        {
            label: "Activated",
            value: stats.activated,
            icon: Check,
            color: "text-green-600",
            bgColor: "text-green-500"
        },
        {
            label: "Pending",
            value: stats.pending,
            icon: AlertCircle,
            color: "text-yellow-600",
            bgColor: "text-yellow-500"
        },
        {
            label: "Disabled",
            value: stats.disabled,
            icon: Shield,
            color: "text-red-600",
            bgColor: "text-red-500"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">{card.label}</span>
                        <card.icon size={18} className={card.bgColor} />
                    </div>
                    <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                </div>
            ))}
        </div>
    );
}