"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, CheckCircle, ShoppingBag, QrCode, Scan, Sparkles } from "lucide-react";
import api from "@/lib/api";
import Loader from "@/shared/Loader";

const iconComponents = {
  ShoppingBag: ShoppingBag,
  QrCode: QrCode,
  Scan: Scan,
};

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    try {
      const response = await api.get("/hero");
      setHeroData(response.data?.data);
    } catch (error) {
      console.error("Error fetching hero:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !heroData) {
    return <Loader text="QKey..." size={50} fullScreen />;
  }

  const steps = heroData.steps.map((step, idx) => ({
    id: idx + 1,
    title: step.title,
    description: step.description,
    icon: iconComponents[step.icon] || ShoppingBag,
    bgColor: step.bgColor,
    iconColor: step.iconColor,
  }));

  return (
    <>
      <section className="bg-white text-black py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-10">
          {/* Left Content */}
          <motion.div
            className="w-full md:w-1/2 space-y-4 md:space-y-6 text-center md:text-left"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase leading-tight md:leading-[1.2] lg:leading-[80px]">
              {heroData.title}
            </h1>

            <p className="text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto md:mx-0">
              {heroData.subtitle}
            </p>

            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
              <Link
                href="/signup"
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-800 text-white rounded-md font-medium hover:bg-gray-900 transition text-sm sm:text-base text-center"
              >
                {heroData.buttonText}
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 sm:px-6 py-2.5 sm:py-3 border border-black text-black rounded-md font-medium hover:bg-gray-700 hover:text-white transition text-sm sm:text-base cursor-pointer"
              >
                {heroData.secondaryButtonText}
              </button>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            className="w-full md:w-1/2 flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="relative w-full max-w-md md:max-w-full">
              <Image
                src={heroData.imageUrl}
                alt="Hero Image"
                width={1000}
                height={1000}
                className="w-full h-auto"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal - same as before but using dynamic data */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[95%] sm:max-w-lg md:max-w-2xl lg:max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden mx-auto"
            >
              <div className="relative bg-gray-900 text-white px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Sparkles size={20} className="text-gray-400 sm:w-6 sm:h-6" />
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                      How It Works
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 sm:p-2 hover:bg-gray-800 rounded-full transition cursor-pointer"
                  >
                    <X size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  Three simple steps to carry inspiration wherever you go
                </p>
              </div>

              <div className="p-4 sm:p-6 md:p-8 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {steps.map((step, index) => {
                    const IconComponent = step.icon;
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center group border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition cursor-pointer"
                      >
                        <div className="relative mb-3 sm:mb-4">
                          <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto ${step.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-105 transition`}>
                            <IconComponent size={24} className={`${step.iconColor} sm:w-7 sm:h-7`} />
                          </div>
                          <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">
                            {step.id}
                          </div>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {!isMobile && (
                  <div className="relative my-6 sm:my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <div className="bg-gray-100 rounded-full p-2">
                        <CheckCircle size={20} className="text-gray-600" />
                      </div>
                    </div>
                  </div>
                )}

                {isMobile && (
                  <div className="my-5 border-t border-gray-200"></div>
                )}

                <div className="text-center mt-4 sm:mt-6">
                  <Link
                    href="/signup"
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition text-sm sm:text-base w-full sm:w-auto"
                  >
                    {heroData.buttonText}
                    <Sparkles size={14} className="sm:w-4 sm:h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}