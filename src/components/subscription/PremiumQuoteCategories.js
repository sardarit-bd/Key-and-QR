"use client";

import { Lightbulb, Heart, Target, Star, Sparkles } from "lucide-react";

export default function PremiumQuoteCategories({
  selectedCategory,
  setSelectedCategory,
}) {
  const quoteCategories = [
    { label: "Motivation", value: "motivation", icon: <Lightbulb size={16} /> },
    { label: "Love", value: "love", icon: <Heart size={16} /> },
    { label: "Faith", value: "faith", icon: <Target size={16} /> },
    { label: "Success", value: "success", icon: <Star size={16} /> },
    { label: "Hope", value: "hope", icon: <Sparkles size={16} /> },
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl px-4 mx-auto">
        <h2 className="text-center text-3xl font-semibold text-gray-900 mb-12">
          Premium Quote Categories
        </h2>

        <div className="flex items-center gap-3 justify-center flex-wrap mb-3">
          {quoteCategories.map((item, index) => (
            <span
              onClick={() => setSelectedCategory(item.value)}
              key={index}
              className={`${
                selectedCategory === item.value
                  ? "bg-gray-800 text-white"
                  : ""
              } text-md bg-gray-100 px-2 lg:px-3 py-1 rounded-full text-gray-600 flex items-center gap-2 hover:bg-gray-800 hover:text-white border border-gray-200 cursor-pointer`}
            >
              {item.icon}
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}