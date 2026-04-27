"use client";

import { X, Smartphone } from "lucide-react";

const DEFAULT_IMAGES = {
  faith: "/images/quote-bg/faith.jpg",
  love: "/images/quote-bg/love.jpg",
  hope: "/images/quote-bg/healing.jpg",
  success: "/images/quote-bg/success.jpg",
  motivation: "/images/quote-bg/strength.jpg",
  personal: "/images/quote-bg/peace.jpg",
};

const CATEGORY_LABELS = {
  faith: "Faith",
  love: "Love",
  hope: "Healing",
  success: "Success",
  motivation: "Strength",
  personal: "Personal Message",
};

const CATEGORY_ICONS = {
  faith: "☾",
  love: "♥",
  hope: "✦",
  success: "☆",
  motivation: "◐",
  personal: "✧",
};

export default function MobilePreview({ quote, onClose }) {
  const category = quote?.category || "faith";
  const backgroundImage = quote?.image?.url || DEFAULT_IMAGES[category] || DEFAULT_IMAGES.faith;
  const categoryLabel = CATEGORY_LABELS[category] || CATEGORY_LABELS.faith;
  const categoryIcon = CATEGORY_ICONS[category] || CATEGORY_ICONS.faith;
  const author = quote?.author || "InspireTag";
  const quoteText = quote?.text || "No quote text available";
  const isPersonalMessage = quote?.category === "personal";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition z-10 cursor-pointer"
          aria-label="Close preview"
        >
          <X size={24} />
        </button>

        {/* Mobile Frame */}
        <div className="relative w-[375px] h-[650px] bg-black rounded-[44px] shadow-2xl overflow-hidden">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[110px] h-[34px] bg-black rounded-b-2xl z-20">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[100px] h-[5px] bg-gray-800 rounded-full" />
          </div>
          
          {/* Speaker grills */}
          <div className="absolute top-2 left-4 w-8 h-1.5 bg-gray-800 rounded-full z-20" />
          <div className="absolute top-2 right-4 w-8 h-1.5 bg-gray-800 rounded-full z-20" />

          {/* Quote Display Area */}
          <div
            className="relative w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            {/* Dark Overlays */}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
            
            {/* Subtle vignette effect */}
            <div className="absolute inset-0 shadow-inner" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col">
              {/* Top spacer */}
              <div className="pt-14" />

              {/* Category Badge */}
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full">
                  <span className="text-[#f3d6a0] text-sm">{categoryIcon}</span>
                  <p className="text-[11px] tracking-wider text-[#f3d6a0] font-medium uppercase">
                    {categoryLabel}
                  </p>
                </div>
              </div>

              {/* Quote Container - Centered vertically */}
              <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-12">
                {/* Quote Text */}
                <h1 className="text-white text-[26px] leading-[1.3] font-serif font-medium text-center drop-shadow-xl tracking-wide">
                  "{quoteText}"
                </h1>

                {/* Author */}
                {!isPersonalMessage && author && (
                  <div className="mt-6 flex items-center gap-2">
                    <div className="w-8 h-px bg-[#e7b96f]/50" />
                    <p className="text-[#e7b96f] text-[13px] font-serif tracking-wide">
                      — {author} —
                    </p>
                    <div className="w-8 h-px bg-[#e7b96f]/50" />
                  </div>
                )}
              </div>

              {/* Bottom Action Area */}
              <div className="pb-8 text-center">
                {/* Heart icon placeholder (like actual app) */}
                <div className="flex justify-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#e7b96f" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                </div>
                
                {/* Website URL */}
                <p className="text-[10px] text-[#e7b96f]/70 tracking-wider">
                  myinspiretag.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Label */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Smartphone size={14} className="text-white/50" />
          <p className="text-center text-white/50 text-xs">
            Mobile preview - actual display on devices
          </p>
        </div>
      </div>
    </div>
  );
}