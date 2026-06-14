"use client";
import { Clock, Gift, Truck, X } from "lucide-react";
import { useEffect, useState } from "react";

function TopHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    { text: "FREE SHIPPING ON ORDERS OVER $50", icon: Truck },
    { text: "GET 10% OFF FIRST ORDER", icon: Gift },
    { text: "24/7 CUSTOMER SUPPORT", icon: Clock },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const CurrentIcon = messages[messageIndex].icon;

  return (
    <div className="relative bg-black text-white py-2.5 px-4 text-center overflow-hidden">
      <div className="container mx-auto">
        <div className="flex items-center justify-center gap-2 md:gap-3 animate-fadeIn">
          <CurrentIcon className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
          <p className="text-xs md:text-sm font-semibold tracking-wide">
            {messages[messageIndex].text}
          </p>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
        aria-label="Close announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default TopHeader;
