'use client'
import { useState } from "react";

export default function PremiumQuoteCategories() {

  const [category, setcategory] = useState("💡 Motivation");



  const quoteCategories = [
    "💡 Motivation",
    "❤️ Love",
    "🙏 Gratitude",
    "🎯 Faith",
    "🏃 Healing",
    "🕊️ Random",
  ];


  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl px-4 mx-auto">

        {/* Heading */}
        <h2 className="text-center text-3xl font-semibold text-gray-900 mb-12">
          Premium Quote Categories
        </h2>

        <div className="flex items-center gap-3 justify-center flex-wrap mb-3">

          {quoteCategories.map((item, index) => (
            <span
              onClick={() => { setcategory(item) }}
              key={index}
              className={`${category === item ? "bg-gray-800 text-white" : ""} text-md bg-gray-100 px-2 lg:px-3 py-1 rounded-full text-gray-600 flex items-center gap-1 hover:bg-gray-800 hover:text-white border border-gray-200 cursor-pointer`}
            >
              {item}
            </span>
          ))}

        </div>
      </div>
    </section>
  );
}
