"use client";

import { Heart, Sparkles, Star, Flame, Smile, ArrowRight } from "lucide-react";
import { useState } from "react";

const CATEGORIES = [
    {
        id: "faith",
        label: "Faith",
        icon: Sparkles,
        color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
        description: "Find strength and hope",
    },
    {
        id: "love",
        label: "Love",
        icon: Heart,
        color: "bg-pink-100 text-pink-700 hover:bg-pink-200",
        description: "Heartfelt messages",
    },
    {
        id: "hope",
        label: "Hope",
        icon: Smile,
        color: "bg-green-100 text-green-700 hover:bg-green-200",
        description: "Optimism and encouragement",
    },
    {
        id: "success",
        label: "Success",
        icon: Star,
        color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        description: "Achievement and growth",
    },
    {
        id: "motivation",
        label: "Motivation",
        icon: Flame,
        color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
        description: "Get inspired",
    },
];

export default function UnlockScreen({
    onSelectCategory,
    selectedCategory,
    dailyLimit = 3,
}) {
    const [selected, setSelected] = useState(selectedCategory || null);

    const handleSelect = (categoryId) => {
        setSelected(categoryId);
        onSelectCategory(categoryId);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles size={28} className="text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Choose Your Emotion
                    </h1>

                    <p className="text-gray-600">
                        What kind of message would you like today? You have {dailyLimit} unlocks remaining.
                    </p>
                </div>

                <div className="space-y-3 mb-8">
                    {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        const isSelected = selected === category.id;

                        return (
                            <button
                                key={category.id}
                                onClick={() => handleSelect(category.id)}
                                disabled={isSelected}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                                    isSelected
                                        ? "border-purple-500 bg-purple-50"
                                        : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                                }`}
                            >
                                <div
                                    className={`p-2 rounded-lg ${
                                        category.color.split(" ")[0]
                                    } ${category.color.split(" ")[1]}`}
                                >
                                    <Icon size={20} />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">
                                        {category.label}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {category.description}
                                    </p>
                                </div>

                                {isSelected && (
                                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-4 h-4 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {selected && (
                    <div className="text-center pt-4 border-t border-gray-100">
                        <div className="inline-flex items-center gap-2 text-sm text-green-600">
                            <ArrowRight size={14} />
                            <span>Loading your message...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}