import { Quote, Heart, Bookmark, Calendar } from "lucide-react";

export default function MyQuoteStats({ stats }) {
  const statConfig = [
    {
      label: "Total Quotes",
      value: stats?.total ?? 0,
      sub: "All time",
      icon: Quote,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: "Favorites",
      value: stats?.favorites ?? 0,
      sub: "Quotes",
      icon: Heart,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
    {
      label: "Categories",
      value: stats?.categories ?? 0,
      sub: "Active",
      icon: Bookmark,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "This Month",
      value: stats?.thisMonth ?? 0,
      sub: "New quotes",
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfig.map((stat, idx) => (
        <div
          key={idx}
          className="bg-[#121526] border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">
              {stat.label}
            </p>

            <h3 className="text-xl font-bold text-white leading-none">
              {stat.value}
            </h3>

            <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
