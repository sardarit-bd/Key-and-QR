"use client";

import { ChevronDown } from "lucide-react";

export default function YourQuotes() {

    const quotes = [
        {
            text: "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.",
            author: "J.K. Rowling"
        },
        {
            text: "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.",
            author: "J.K. Rowling"
        },
        {
            text: "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.",
            author: "J.K. Rowling"
        }
    ];

    return (
        <section className="max-w-4xl mx-auto py-16 px-4">
            {/* Outer Container */}
            <div className="bg-gray-100 py-12 px-6 rounded-2xl shadow-sm">

                {/* Title */}
                <h2 className="text-center text-2xl font-semibold mb-10">
                    Your Quotes
                </h2>

                {/* Quotes List */}
                <div className="space-y-4">
                    {quotes.map((q, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl p-5 shadow-sm flex items-start justify-between border border-gray-200"
                        >
                            <div>
                                <p className="text-gray-800 leading-relaxed">
                                    “{q.text}”
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    — {q.author}
                                </p>
                            </div>

                            <button className="text-gray-500 hover:text-gray-700">
                                <ChevronDown size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="mt-6">
                    <button className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-900 transition text-sm font-medium tracking-wide">
                        Subscribe For More Quotes →
                    </button>
                </div>

            </div>
        </section>
    );
}
