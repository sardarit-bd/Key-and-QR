import { Tag, User, Power, PowerOff, Star, TrendingUp } from "lucide-react";

export default function StatsCards({ stats }) {
    const cards = [
        {
            label: "Total Assignments",
            value: stats.total,
            icon: TrendingUp,
            color: "bg-blue-500"
        },
        {
            label: "Tag Assignments",
            value: stats.tagAssignments,
            icon: Tag,
            color: "bg-purple-500"
        },
        {
            label: "User Assignments",
            value: stats.userAssignments,
            icon: User,
            color: "bg-green-500"
        },
        {
            label: "Active",
            value: stats.active,
            icon: Power,
            color: "bg-emerald-500"
        },
        {
            label: "Inactive",
            value: stats.inactive,
            icon: PowerOff,
            color: "bg-red-500"
        },
        {
            label: "High Priority",
            value: stats.highPriority,
            icon: Star,
            color: "bg-amber-500"
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {cards.map((card, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">{card.label}</span>
                        <card.icon size={18} className={`${card.color} text-white p-1 rounded`} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                </div>
            ))}
        </div>
    );
}