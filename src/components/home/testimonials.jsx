"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const contentContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const textVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.25, 0.1, 0.1, 1] },
  },
};

export default function InspirationBanner() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

  return (
    <motion.section
      ref={sectionRef}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="w-full bg-[#FAF9F7] py-12 px-6 md:px-12"
    >
      {/* max-w increased to 1600px and 1720px on ultra-wide screens 
        to reduce the empty space on 1920px resolutions 
      */}
      <div className="mx-auto max-w-[1200px] xl:max-w-[1600px] 2xl:max-w-[1720px]">
        <div className="relative overflow-hidden rounded-2xl h-[280px] md:h-[350px] bg-[#F2EFEB] w-full shadow-sm border border-[#F0ECE6]">
          
          {/* Next.js Optimized Full-Width Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/testimonials/banner-image.png"
              alt="Inspiration Banner Background"
              fill
              className="object-cover object-center"
              quality={90}
            />
          </div>

          {/* Left Content Box with Dynamic Staggered Motion */}
          <motion.div 
            variants={contentContainerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="absolute inset-0 flex items-center px-6 sm:px-12 md:px-10 2xl:px-58 z-10"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 md:gap-10 w-full">
              
              {/* Logo Wrapper */}
              <motion.div variants={logoVariants} className="shrink-0">
                <img
                  src="/testimonials/logo-black.png"
                  alt="Logo"
                  className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 object-contain"
                />
              </motion.div>

              {/* Typography Group */}
              <div className="flex flex-col justify-center">
                <motion.h2 
                  variants={textVariants}
                  className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[38px] xl:text-[28px] text-black leading-[1.2] tracking-[-0.01em]"
                >
                  MyInspiration is
                  <br />
                  always with you.
                </motion.h2>

                <motion.p 
                  variants={textVariants}
                  className="font-serif mt-4 text-sm sm:text-base md:text-lg text-gray-800 font-medium tracking-wide"
                >
                  Open. Scan. Get inspired.
                </motion.p>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </motion.section>
  );
}