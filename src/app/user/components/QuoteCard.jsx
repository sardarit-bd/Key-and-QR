"use client";
import { Sparkles } from "lucide-react";

export default function QuoteCard() {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Your Daily Quote</h3>
                <span className="text-sm bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles size={14} /> Motivation
                </span>
            </div>

            <p className="text-gray-800 italic text-lg">
                “Happiness can be found even in the darkest of times,
                if one only remembers to turn on the light.”
            </p>

            <p className="text-sm text-gray-500 mt-2">— J.K. Rowling</p>
        </div>
    );
}
