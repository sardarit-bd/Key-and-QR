'use client';

import Image from "next/image";
import { Quote, Sparkles } from "lucide-react";

export default function DailyQuoteBanner() {
  return (
    <section className="relative h-full min-h-[180px] sm:min-h-[200px] lg:min-h-[240px] w-full overflow-hidden rounded-[20px] sm:rounded-[24px] border border-[#5B3B26]/60 bg-[#090B12] shadow-lg">
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/dashboard/daily-quote-banner.webp"
          alt="Daily Quote Banner"
          fill
          priority
          className="object-cover object-[75%_center] opacity-90 mix-blend-screen"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Left Overlay Gradient for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070911] via-[#070911]/90 to-transparent" />
      <div className="absolute inset-0 bg-black/10" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-5 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-5 md:py-6">
        <div className="max-w-[280px] sm:max-w-[320px] md:max-w-[380px]">
          
          <Quote
            size={22}
            className="mb-2 sm:mb-3 text-[#B98A63]/80 w-[18px] h-[18px] sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]"
            fill="currentColor"
            stroke="none"
          />

          <h2 className="font-serif italic text-[18px] sm:text-[20px] md:text-[22px] lg:text-[26px] leading-[1.3] tracking-wide text-[#F8F3EA] mb-2 sm:mb-3">
            Stay positive, work hard,<br />
            make it happen.
          </h2>

          <p className="text-[12px] sm:text-[13px] md:text-[14px] text-[#B78D69] mb-3 sm:mb-4 md:mb-5">
            — InspireTag
          </p>

          <button className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#8A6036] bg-[#16110D]/90 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-[12px] md:text-[13px] font-medium text-[#FDB65C] backdrop-blur-sm transition-all duration-300 hover:bg-[#211812] hover:border-[#FDB65C]/80 hover:shadow-[0_0_15px_rgba(253,182,92,0.15)]">
            <Sparkles size={14} className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px]" />
            Your Daily Quote
          </button>
        </div>
      </div>
      
    </section>
  );
}