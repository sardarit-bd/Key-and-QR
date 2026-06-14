"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    id: "1",
    image: "/how-it-works/shell.png",
    title: "Choose Your Shell",
    description: "Pick the shell that feels most like you.",
  },
  {
    id: "2",
    image: "/how-it-works/message2.png",
    title: "Make It Meaningful",
    description: "Add a personal message or enjoy daily inspiration.",
  },
  {
    id: "3",
    image: "/how-it-works/scan.png",
    title: "Scan & Discover",
    description:
      "Reveal inspiration, save favorites, and reflect anytime you need it.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#F8F6F2] px-4 py-12 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-[1600px]"
      >
        {/* Header Section */}
        <div className="text-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-[64px] leading-tight text-[#182235]">
            How It Works
          </h1>
          <p className="mt-5 text-base md:text-lg lg:text-[20px] text-[#737373] max-w-xl mx-auto leading-relaxed">
            Three simple steps to carry inspiration with you, always.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 1. DESKTOP LAYOUT (hidden lg:block)                                       */}
        {/* ========================================================================= */}
        <div className="hidden lg:block mt-20">
          {/* Desktop Step Numbers Indicator */}
          <div className="flex items-center justify-center gap-8 xl:gap-12 mb-12">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F2EBDD]">
              1
            </div>

            <div className="relative h-8 w-[280px] xl:w-[380px]">
              <Image
                src="/how-it-works/divider.png"
                alt="divider"
                fill
                className="object-contain"
              />
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F2EBDD]">
              2
            </div>

            <div className="relative h-8 w-[280px] xl:w-[380px]">
              <Image
                src="/how-it-works/divider.png"
                alt="divider"
                fill
                className="object-contain"
              />
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F2EBDD]">
              3
            </div>
          </div>

          {/* Desktop Steps Grid */}
          <div className="grid grid-cols-3 gap-12">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center text-center"
              >
                <div className="relative h-[320px] w-[320px] xl:h-[380px] xl:w-[380px]">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="mt-6 font-serif text-[32px] leading-tight text-[#182235]">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-[300px] text-[18px] leading-[1.7] text-[#6D6D6D]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TABLET LAYOUT (hidden md:block lg:hidden)                              */}
        {/* ========================================================================= */}
        <div className="hidden md:block lg:hidden mt-16">
          <div className="grid grid-cols-3 gap-6 xl:gap-8">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center text-center"
              >
                {/* Step Number Above Illustration */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2EBDD] text-base font-medium text-[#1D2433] mb-6">
                  {step.id}
                </div>
                {/* Proportionally Smaller Medium Image */}
                <div className="relative h-[220px] w-[220px]">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="mt-5 font-serif text-2xl leading-tight text-[#182235]">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-[240px] text-sm leading-relaxed text-[#6D6D6D]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MOBILE LAYOUT (block md:hidden)                                        */}
        {/* ========================================================================= */}
        <div className="block md:hidden mt-12 space-y-16">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex flex-col items-center text-center px-2"
            >
              {/* Step Number Above Image */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2EBDD] text-base font-medium text-[#1D2433] mb-4">
                {step.id}
              </div>
              {/* Smaller Optimized Image for Small Screens */}
              <div className="relative h-[240px] w-[240px]">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="mt-4 font-serif text-xl sm:text-2xl leading-tight text-[#182235]">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[280px] text-sm sm:text-base leading-relaxed text-[#6D6D6D]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Decorative Luxury Section Divider */}
        <div className="mt-20 md:mt-24 flex items-center gap-6">
          <div className="h-px flex-1 bg-[#ECE6DA]" />
          <div className="text-[#C9A86A] text-2xl">♡</div>
          <div className="h-px flex-1 bg-[#ECE6DA]" />
        </div>

        {/* CTA Button Layout Block */}
        <div className="mt-12 flex justify-center w-full px-2 sm:px-0">
          <Link
            href="/shop"
            className="group flex items-center justify-center gap-4 rounded-2xl bg-[#0D1B33] text-white font-medium transition hover:bg-[#13264A]
              w-full sm:w-auto
              h-[58px] sm:h-[64px] lg:h-[68px]
              min-w-0 sm:min-w-[340px] lg:min-w-[380px]
              px-6 sm:px-8 lg:px-10
              text-base sm:text-lg lg:text-[20px]"
          >
            <span>Explore Our Collection</span>
            <ArrowRight
              size={20}
              className="transition group-hover:translate-x-1 shrink-0"
            />
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
