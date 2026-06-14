"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Gift, Heart, Sun } from "lucide-react";

export default function HeroSection({
  ctaLink = "/shop",
  secondaryCtaLink = "/how-it-works",
}) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.15 });
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
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.25, 0.1, 0.1, 1] },
    },
  };

  return (
    <motion.section
      ref={sectionRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative w-full min-h-[80vh] md:min-h-[85vh] lg:min-h-[80vh] xl:min-h-[75vh] flex items-center overflow-hidden bg-[#FAF9F7]"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full">
        <div className="relative w-full h-full">
          <Image
            src="/hero/hero-bg.png"
            alt="Luxury QR keychain memory charm - Elegant shell design with pearl finish"
            fill
            className="object-cover object-[75%_center] md:object-[80%_center] lg:object-[85%_center] xl:object-[90%_center]"
            priority
            quality={95}
          />
        </div>
      </div>

      {/* Dynamic Overlay Layers */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F7] via-[#FAF9F7]/95 to-transparent hidden md:block md:w-[70%] lg:w-[60%]" />
      <div className="absolute inset-0 bg-[#FAF9F7]/90 sm:bg-[#FAF9F7]/85 md:hidden" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-12 md:px-16 lg:px-24 py-16 md:py-24">
        <div className="w-full md:w-[60%] lg:w-[55%] xl:w-[750px]">
          <motion.div
            className="space-y-6 md:space-y-8"
            variants={containerVariants}
          >
            {/* Luxury Badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2">
                <span className="text-[#C8A06B] text-base md:text-lg">✦</span>
                <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#C8A06B] font-bold uppercase">
                  ONE SCAN. A BETTER YOU.
                </span>
              </div>
            </motion.div>

            {/* Serif Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-serif text-4xl sm:text-5xl md:text-6xl xl:text-[64px] leading-[1.15] tracking-[-0.01em] text-gray-900"
            >
              Carry inspiration.
              <br />
              Share what matters.
            </motion.h1>

            {/* Supporting Text */}
            <motion.p
              variants={itemVariants}
              className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-md md:max-w-lg"
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
                className="px-8 py-4 bg-gray-900 text-white text-sm font-medium tracking-wide rounded-xl transition-all duration-300 hover:bg-gray-800 hover:shadow-xl text-center active:scale-[0.98]"
              >
                Shop Collection
              </Link>

              <Link
                href={secondaryCtaLink}
                className="px-8 py-4 border border-gray-300 text-gray-800 text-sm font-medium tracking-wide rounded-xl transition-all duration-300 hover:border-gray-800 hover:text-gray-900 hover:bg-white text-center backdrop-blur-sm active:scale-[0.98]"
              >
                How It Works
              </Link>
            </motion.div>

            {/* Responsive Features Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 md:gap-8 pt-8 max-w-[650px]"
            >
              {features.map((feature) => {
                const IconComponent = feature.icon;

                return (
                  <div
                    key={feature.id}
                    className="flex flex-row sm:flex-col items-center sm:text-center gap-4 sm:gap-2"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm sm:shadow-none sm:bg-transparent sm:h-auto sm:w-auto sm:mb-2">
                      <IconComponent
                        strokeWidth={1.5}
                        className="h-6 w-6 sm:h-8 sm:w-8 text-black"
                      />
                    </div>

                    <span className="text-sm md:text-base font-serif font-medium leading-tight text-gray-900 max-w-[150px]">
                      {feature.title}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Bottom Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/40 to-transparent" />
    </motion.section>
  );
}