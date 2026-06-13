"use client";

import Image from "next/image";

export default function InspirationBanner() {
  return (
    <section className="w-full px-4 md:px-6 py-8">
      <div
        className="relative overflow-hidden rounded-md h-[240px] md:h-[300px] bg-center bg-cover"
        style={{
          backgroundImage: "url('/testimonials/banner-image.png')",
        }}
      >
        {/* Left Content */}
        <div className="absolute inset-y-0 left-0 flex items-center px-8 md:px-14">
          <div className="flex items-center gap-8">
            <img
              src="/testimonials/logo-black.png"
              alt="Logo"
              className="w-20 md:w-24 h-20 md:h-24"
            />

            <div>
              <h2 className="font-serif text-2xl md:text-4xl text-black leading-tight">
                Inspiration is
                <br />
                always with you.
              </h2>

              <p className="mt-3 text-base md:text-xl text-black">
                Open. Scan. Get inspired.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
