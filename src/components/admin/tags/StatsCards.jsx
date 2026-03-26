// app/dashboard/admin/tags/components/StatsCards.jsx
import { AlertCircle, Check, DollarSign, Shield, Tag, Users } from "lucide-react";

export default function StatsCards({ stats, tags }) {
    // Calculate additional stats from tags array
    const subscriberCount = tags?.filter(t => t.subscriptionType === "subscriber").length || 0;
    const freeCount = tags?.filter(t => t.subscriptionType === "free").length || 0;

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
        },
        {
            label: "Subscriber Tags",
            value: subscriberCount,
            icon: DollarSign,
            color: "text-purple-600",
            bgColor: "text-purple-500"
        },
        {
            label: "Free Tags",
            value: freeCount,
            icon: Users,
            color: "text-blue-600",
            bgColor: "text-blue-500"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {cards.map((card, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition">
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