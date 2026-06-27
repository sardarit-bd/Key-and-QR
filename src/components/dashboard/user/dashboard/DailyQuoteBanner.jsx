'use client';

import Image from "next/image";
import { Quote, Sparkles } from "lucide-react";

export default function DailyQuoteBanner() {
  return (
    <section className="relative h-full min-h-[220px] lg:h-[240px] w-full overflow-hidden rounded-[24px] border border-[#5B3B26]/60 bg-[#090B12] shadow-lg">
      
      {/* Background Image */}
      {/* Note: Ensure your next.config.js allows this path or replace with your actual asset */}
      <div className="absolute inset-0">
        <Image
          src="/images/dashboard/daily-quote-banner.webp"
          alt="Daily Quote Banner"
          fill
          priority
          className="object-cover object-[75%_center] opacity-90 mix-blend-screen"
        />
      </div>

      {/* Left Overlay Gradient for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070911] via-[#070911]/90 to-transparent" />
      <div className="absolute inset-0 bg-black/10" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-8 md:px-10 py-6">
        <div className="max-w-[380px]">
          
          <Quote
            size={22}
            className="mb-3 text-[#B98A63]/80"
            fill="currentColor"
            stroke="none"
          />

          <h2
            className="
              font-serif
              italic
              text-[22px]
              md:text-[26px]
              leading-[1.3]
              tracking-wide
              text-[#F8F3EA]
              mb-3
            "
          >
            Stay positive, work hard,<br />
            make it happen.
          </h2>

          <p className="text-[14px] text-[#B78D69] mb-5">
            — InspireTag
          </p>

          <button
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#8A6036]
              bg-[#16110D]/90
              px-4
              py-2
              text-[13px]
              font-medium
              text-[#FDB65C]
              backdrop-blur-sm
              transition-all
              duration-300
              hover:bg-[#211812]
              hover:border-[#FDB65C]/80
              hover:shadow-[0_0_15px_rgba(253,182,92,0.15)]
            "
          >
            <Sparkles size={14} />
            Your Daily Quote
          </button>
        </div>
      </div>
      
    </section>
  );
}