"use client";

import { 
    FiZap, 
    FiHeart, 
    FiSun, 
    FiStar, 
    FiTrendingUp, 
    FiRefreshCw 
} from "react-icons/fi";
import { FaHandsPraying, FaHandHoldingHeart } from "react-icons/fa";

const CATEGORIES = [
    { id: "motivation", label: "Motivation", icon: FiZap, color: "text-orange-500" },
    { id: "love", label: "Love", icon: FiHeart, color: "text-pink-500" },
    { id: "gratitude", label: "Gratitude", icon: FaHandHoldingHeart, color: "text-green-500" },
    { id: "faith", label: "Faith", icon: FaHandsPraying, color: "text-purple-500" },
    { id: "healing", label: "Healing", icon: FiSun, color: "text-blue-500" },
    { id: "success", label: "Success", icon: FiStar, color: "text-yellow-500" },
    { id: "hope", label: "Hope", icon: FiTrendingUp, color: "text-teal-500" },
    { id: "random", label: "Random", icon: FiRefreshCw, color: "text-gray-500" },
];

export default function CategorySelector({ selectedCategory, onSelectCategory, isSubscriber, dailyLimit = 3 }) {
    if (!isSubscriber) {
        return (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 text-center border border-gray-200">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCrown size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Feature</h3>
                <p className="text-gray-500 text-sm mb-4">
                    Choose from 7+ quote categories when you upgrade to Premium!
                </p>
                <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm hover:from-purple-700 hover:to-pink-700 transition"
                >
                    Upgrade to Premium
                    <FiArrowRight size={14} />
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FiZap size={18} className="text-purple-500" />
                    Choose Your Category
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>✨ {dailyLimit} unlocks remaining today</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 cursor-pointer ${
                                isSelected
                                    ? "bg-gray-900 text-white shadow-md scale-105"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                            }`}
                        >
                            <Icon size={14} className={isSelected ? "text-white" : cat.color} />
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
                {dailyLimit === 3 
                    ? "✨ Premium members get 3 daily unlocks + category selection" 
                    : "🎉 Upgrade to Premium for more categories and daily unlocks"}
            </p>
        </div>
    );
}