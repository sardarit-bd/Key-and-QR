"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Gift, Sparkles, Heart, Sun } from "lucide-react";

export default function HeroSection({
  ctaLink = "/shop",
  secondaryCtaLink = "/how-it-works",
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const features = [
    {
      id: 1,
      icon: Gift,
      title: "Gift a Personal Message",
    },
    {
      id: 2,
      icon: Sun,
      title: "Discover Daily Inspiration",
    },
    {
      id: 3,
      icon: Heart,
      title: "Keep What Matters",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.1, 1] },
    },
  };

  return (
    <section className="relative w-full min-h-[77vh] md:min-h-[85vh] lg:min-h-[77vh] overflow-hidden">
      {/* Background Image - positioned to show on the right */}
      <div className="absolute inset-0 w-full h-full">
        <div className="relative w-full h-full">
          <Image
            src="/hero/hero-bg.png"
            alt="Luxury QR keychain memory charm - Elegant shell design with pearl finish"
            fill
            className="object-cover object-[75%_center] md:object-[85%_center] lg:object-[90%_center]"
            priority
            quality={95}
          />
        </div>
      </div>

      {/* Left White-to-Transparent Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/40 md:from-white md:via-white/50 md:to-transparent" />

      {/* Mobile gradient adjustment - stronger overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/80 md:hidden" />

      {/* Content Container */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-20 md:py-24 lg:py-10">
        <div className="w-full md:w-[55%] lg:w-[65%] xl:w-[850px]">
          <motion.div
            className="space-y-6 sm:space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {/* Luxury Badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2">
                <span className="text-[#C8A06B] text-lg">✦</span>
                <span className="text-[11px] sm:text-xs tracking-[0.25em] text-[#C8A06B] font-bold uppercase">
                  ONE SCAN. A BETTER YOU.
                </span>
              </div>
            </motion.div>

            {/* Serif Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-['Playfair_Display',_serif] text-5xl sm:text-6xl md:text-7xl lg:text-[60px] leading-[1.15] sm:leading-[1.2] tracking-[-0.02em] text-gray-900"
            >
              Carry inspiration.
              <br />
              Share what matters.
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              variants={itemVariants}
              className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-md"
            >
              A meaningful shell charm with a surprise inside. Scan to discover
              daily inspiration, heartfelt messages, and moments that stay with
              you.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Link
                href={ctaLink}
                className="group relative px-8 py-3.5 bg-gray-900 text-white text-sm sm:text-base font-medium tracking-wide overflow-hidden rounded-sm transition-all duration-300 hover:bg-gray-800 hover:shadow-lg text-center"
              >
                <span className="relative z-10">Shop Collection</span>
              </Link>

              <Link
                href={secondaryCtaLink}
                className="px-8 py-3.5 border border-gray-400 text-gray-800 text-sm sm:text-base font-medium tracking-wide rounded-sm transition-all duration-300 hover:border-gray-800 hover:text-gray-900 hover:bg-white/50 text-center backdrop-blur-sm"
              >
                How It Works
              </Link>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 max-w-[550px] gap-8 pt-10"
            >
              {features.map((feature) => {
                const IconComponent = feature.icon;

                return (
                  <div
                    key={feature.id}
                    className="flex flex-col items-center text-center group"
                  >
                    <IconComponent
                      size={36}
                      strokeWidth={1.5}
                      className="mb-4 text-black"
                    />

                    <span className="max-w-[140px] text-lg font-medium leading-relaxed text-gray-900">
                      {feature.title}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative element - subtle scan line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent" />
    </section>
  );
}
