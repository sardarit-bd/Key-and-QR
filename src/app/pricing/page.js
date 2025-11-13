"use client";

import { Check, Sparkles, Heart, Smile, Sun, Feather, Gift } from "lucide-react";

export default function PremiumQuotes() {
    const features = [
        "Access to all premium quote categories",
        "Hundreds of curated motivational quotes",
        "New quotes added weekly",
        "Ad-free experience",
        "Priority customer support",
        "Exclusive quote collections",
    ];

    const categories = [
        {
            icon: <Feather size={22} />,
            title: "Motivation",
            desc: "Stay driven with quotes that spark your ambition and push you forward.",
        },
        {
            icon: <Heart size={22} />,
            title: "Love",
            desc: "Discover words that warm your heart and celebrate meaningful connections.",
        },
        {
            icon: <Gift size={22} />,
            title: "Gratitude",
            desc: "Find calm and appreciation through quotes that remind you to cherish life's blessings.",
        },
        {
            icon: <Sun size={22} />,
            title: "Faith",
            desc: "Uplifting thoughts to strengthen your spirit and renew your sense of hope.",
        },
        {
            icon: <Smile size={22} />,
            title: "Joy",
            desc: "Spread smiles with quotes that celebrate positivity and simple joys.",
        },
        {
            icon: <Sparkles size={22} />,
            title: "Random",
            desc: "Let fate pick your quote — a fresh dose of inspiration every time.",
        },
    ];

    return (
        <section className="max-w-5xl mx-auto py-16 px-4 text-center">

            {/* Badge */}
            <div className="inline-block bg-gray-100 px-4 py-1 rounded-full text-sm font-medium text-gray-700 mb-3">
                ⭐ Premium Membership
            </div>

            {/* Title */}
            <h1 className="text-3xl font-semibold">Unlock Premium Quotes</h1>
            <p className="text-gray-600 mt-2 mb-10">
                Get access to hundreds of categorized quotes for only $2.99/month
            </p>

            {/* Price Card */}
            <div className="max-w-md mx-auto border rounded-xl shadow-sm py-10 px-6 mb-16">
                <h2 className="text-4xl font-bold">$2.99
                    <span className="text-sm font-normal text-gray-500">/month</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Cancel anytime, no commitment
                </p>

                {/* Features */}
                <div className="mt-8 space-y-3 text-left max-w-sm mx-auto">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Check size={18} className="text-black" />
                            <p className="text-gray-700 text-sm">{feature}</p>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <button className="w-full bg-black text-white py-3 rounded-md mt-8 hover:bg-gray-900 transition">
                    Start Premium Trial - 7 Days Free
                </button>

                <p className="text-xs text-gray-500 mt-3">
                    Then $2.99/month. Cancel anytime.
                </p>
            </div>

            {/* Categories Title */}
            <h2 className="text-xl font-semibold mb-8">Premium Quote Categories</h2>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {categories.map((cat, i) => (
                    <div
                        key={i}
                        className="bg-white shadow rounded-xl p-5 text-left shadow-sm hover:shadow transition"
                    >
                        <div className="mb-3 text-gray-700">
                            {cat.icon}
                        </div>
                        <h3 className="font-semibold">{cat.title}</h3>
                        <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                            {cat.desc}
                        </p>
                    </div>
                ))}
            </div>

        </section>
    );
}
