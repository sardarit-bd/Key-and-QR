"use client";

import { Heart, Sparkles, Star, Flame, Smile } from "lucide-react";

const CATEGORY_META = {
  faith: { icon: Sparkles, bg: "bg-[#f5efe6]", accent: "text-[#c8a45d]", text: "Preparing today’s verse..." },
  love: { icon: Heart, bg: "bg-[#f8eef0]", accent: "text-[#d79aa5]", text: "Opening your message..." },
  hope: { icon: Smile, bg: "bg-[#eef2ee]", accent: "text-[#9fb1a5]", text: "Preparing a gentle message..." },
  success: { icon: Star, bg: "bg-[#f4eee7]", accent: "text-[#b79a72]", text: "Your message is ready..." },
  motivation: { icon: Flame, bg: "bg-[#edf3f6]", accent: "text-[#8faebb]", text: "Finding your next step..." },
  personal: { icon: Heart, bg: "bg-[#f7f1eb]", accent: "text-[#c5a07b]", text: "Preparing your message..." },
};

export default function MessageLoadingScreen({ category = "faith" }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.faith;
  const Icon = meta.icon;

  return (
    <div className={`min-h-screen ${meta.bg} flex items-center justify-center px-4 py-6`}>
      <div className="w-full max-w-sm md:max-w-md text-center">
        <h1 className="text-[34px] md:text-[38px] font-semibold text-[#8d7456] mb-8">
          InspireTag
        </h1>

        <p className="text-[20px] md:text-[22px] text-[#7d725f] mb-6">
          {meta.text}
        </p>

        <div className="w-20 h-20 md:w-24 md:h-24 bg-white/70 rounded-full shadow-sm flex items-center justify-center mx-auto">
          <Icon className={meta.accent} size={34} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}