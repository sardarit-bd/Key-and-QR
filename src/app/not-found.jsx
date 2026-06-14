"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import Lottie to prevent SSR (Server-Side Rendering) issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// Import your downloaded Lottie JSON file here
// import notFoundAnim from "@/assets/not-found-animation.json"; 
import notFoundAnim from "@/lib/assets/not-found-animation.json"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

export default function NotFound() {
  return (
    <section className="w-full min-h-[85vh] flex items-center justify-center bg-[#FAF9F7] px-6 py-12">
      <div className="mx-auto max-w-[1200px] xl:max-w-[1440px] px-6 sm:px-12 md:px-20 2xl:px-60 w-full flex items-center justify-center">
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center max-w-xl w-full space-y-6"
        >
          {/* Lottie Animation Wrapper */}
          <motion.div 
            variants={itemVariants}
            className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[450px] aspect-square flex items-center justify-center"
          >
            <Lottie 
              animationData={notFoundAnim} 
              loop={true}
              className="w-full h-full object-contain"
            />
          </motion.div>

          {/* Text Content Block */}
          {/* <div className="space-y-3">
            <motion.h2 
              variants={itemVariants}
              className="font-serif text-3xl sm:text-4xl md:text-5xl text-black leading-tight"
            >
              Page Not Found
            </motion.h2>

            <motion.p 
              variants={itemVariants}
              className="text-gray-600 text-sm sm:text-base md:text-lg max-w-md mx-auto leading-relaxed"
            >
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </motion.p>
          </div> */}

          {/* Action Button */}
          <motion.div variants={itemVariants} className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-black px-8 py-4 text-sm font-medium text-white shadow-md transition-all duration-300 hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98]"
            >
              Back to Home
            </Link>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}