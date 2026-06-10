"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ScanLine, SunMedium, Bookmark, Send } from "lucide-react";
import { PiStarFourFill } from "react-icons/pi";

const steps = [
  {
    id: 1,
    title: "Scan",
    description: "Use your phone to scan the tag inside the shell charm.",
    icon: ScanLine,
  },
  {
    id: 2,
    title: "Discover",
    description: "Get a new quote, message, or daily inspiration.",
    icon: SunMedium,
  },
  {
    id: 3,
    title: "Save",
    description: "Save your favorites and write reflections that matter.",
    icon: Bookmark,
  },
  {
    id: 4,
    title: "Inspire",
    description: "Share inspiration or send a message to someone special.",
    icon: Send,
  },
];

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.1, 0.1, 1],
    },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const desktopCardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.12,
      ease: [0.25, 0.1, 0.1, 1],
    },
  }),
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: [0.25, 0.1, 0.1, 1],
    },
  }),
};

const ctaVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.4,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
  },
};

const iconVariants = {
  hover: {
    scale: 1.08,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export default function HowItWorksSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={sectionRef}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="py-8 px-6"
    >
      <div className="mx-auto max-w-[1800px]">
        <div className="rounded-[20px] bg-[#FAF9F7] px-8 py-20 lg:px-60">
          {/* Heading */}
          <div className="text-center">
            <motion.div
              variants={badgeVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="mb-4 flex items-center justify-center gap-4"
            >
              <div className="h-px w-12 bg-[#D9C7A1]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5A5A5A]">
                How It Works
              </span>
              <div className="h-px w-12 bg-[#D9C7A1]" />
            </motion.div>

            <motion.h2
              variants={headingVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="hidden lg:block font-serif text-4xl md:text-5xl text-black"
            >
              Simple steps. Meaningful moments.
            </motion.h2>
          </div>

          {/* Desktop */}
          <div className="relative mt-20 hidden lg:block">
            <div className="grid grid-cols-4 gap-12">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    custom={index}
                    variants={desktopCardVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="relative text-center"
                  >
                    {/* Connector */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-[74%] top-[58px] w-[68%]">
                        <div className="relative border-t border-dashed border-[#E6DCC7]">
                          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-[#D6B77A]">
                            {/* ✦ */}
                            <PiStarFourFill />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Number */}
                    <div className="absolute left-16 top-0 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                      {step.id}
                    </div>

                    {/* Icon Circle */}
                    <motion.div
                      variants={iconVariants}
                      whileHover="hover"
                      className="mx-auto flex h-26 w-26 items-center justify-center rounded-full bg-[#F2EFEB]"
                    >
                      <Icon
                        strokeWidth={1.5}
                        className="h-12 w-12 text-black"
                      />
                    </motion.div>

                    <h3 className="mt-8 text-3xl font-serif text-black">
                      {step.title}
                    </h3>

                    <p className="mx-auto mt-4 max-w-[220px] text-lg leading-relaxed text-[#444]">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Mobile */}
          <div className="mt-14 lg:hidden">
            <div className="text-center">
              <motion.h2
                variants={headingVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="font-serif text-[42px] leading-[1.05] text-black"
              >
                Simple steps.
                <br />
                Meaningful
                <br />
                moments.
              </motion.h2>

              <motion.div
                variants={badgeVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="mt-6 flex items-center justify-center gap-3"
              >
                <div className="h-px w-12 bg-[#D9C7A1]" />
                <PiStarFourFill className="text-[#D6B77A]" />
                <div className="h-px w-12 bg-[#D9C7A1]" />
              </motion.div>
            </div>

            <div className="relative mt-14">
              {/* Vertical Line */}
              <div className="absolute left-[44px] top-12 bottom-55 w-px bg-[#E6DCC7]" />

              <div className="space-y-12">
                {steps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <motion.div
                      key={step.id}
                      custom={index}
                      variants={mobileItemVariants}
                      initial="hidden"
                      animate={isInView ? "visible" : "hidden"}
                      className="relative flex items-start gap-5"
                    >
                      {/* Left Side */}
                      <div className="relative shrink-0">
                        {/* Number */}
                        <div className="absolute -left-6 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                          {step.id}
                        </div>

                        {/* Icon Circle */}
                        <motion.div
                          variants={iconVariants}
                          whileHover="hover"
                          className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F2EFEB]"
                        >
                          <Icon
                            strokeWidth={1.5}
                            className="h-8 w-8 text-black"
                          />
                        </motion.div>
                      </div>

                      {/* Content */}
                      <div className="pt-3">
                        <h3 className="font-serif text-2xl text-black">
                          {step.title}
                        </h3>

                        <p className="mt-2 max-w-[170px] text-[15px] leading-7 text-[#555]">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* CTA Button */}
              <motion.div
                variants={ctaVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="mt-16 text-center"
              >
                <motion.button
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="rounded-xl bg-black px-10 py-4 text-white shadow-lg"
                >
                  Shop Collection
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}