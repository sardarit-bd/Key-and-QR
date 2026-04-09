"use client";

import { FaFire, FaHeart, FaPrayingHands, FaTrophy, FaStar } from "react-icons/fa";

export default function PremiumQuoteCategories({
  selectedCategory,
  setSelectedCategory,
}) {
  const quoteCategories = [
    { label: "Motivation", value: "motivation", icon: FaFire },
    { label: "Love", value: "love", icon: FaHeart },
    { label: "Faith", value: "faith", icon: FaPrayingHands },
    { label: "Success", value: "success", icon: FaTrophy },
    { label: "Hope", value: "hope", icon: FaStar },
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl px-4 mx-auto">
        <h2 className="text-center text-3xl font-semibold text-gray-900 mb-12">
          Premium Quote Categories
        </h2>

        <div className="flex items-center gap-3 justify-center flex-wrap mb-3">
          {quoteCategories.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                onClick={() => setSelectedCategory(item.value)}
                key={index}
                className={`
                  text-md px-4 lg:px-5 py-2 rounded-full 
                  flex items-center gap-2 border 
                  transition-all duration-200 cursor-pointer font-medium
                  ${selectedCategory === item.value 
                    ? "bg-gray-900 text-white border-gray-900 shadow-md" 
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }
                `}
              >
                <IconComponent size={14} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}