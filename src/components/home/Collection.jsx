"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

const images = [
    "/home/chabi1.png",
    "/home/chabi2.png",
    "/home/chabi1.png",
    "/home/chabi2.png",
    "/home/chabi1.png",
    "/home/chabi2.png",
];

export default function Collection() {
    const VISIBLE_COUNT = 4;
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalImages = images.length;

    // Navigation bounds (loop correctly)
    const nextSlide = () => {
        setCurrentIndex((prev) =>
            prev + 1 > totalImages - VISIBLE_COUNT ? 0 : prev + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prev) =>
            prev - 1 < 0 ? totalImages - VISIBLE_COUNT : prev - 1
        );
    };

    // Visible images calculation
    const visibleImages = useMemo(() => {
        return images.slice(currentIndex, currentIndex + VISIBLE_COUNT).length ===
            VISIBLE_COUNT
            ? images.slice(currentIndex, currentIndex + VISIBLE_COUNT)
            : [
                ...images.slice(currentIndex),
                ...images.slice(0, VISIBLE_COUNT - (totalImages - currentIndex)),
            ];
    }, [currentIndex, totalImages]);

    return (
        <section className="bg-white text-black py-20 overflow-hidden">
            <div className="container mx-auto text-center relative px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <motion.h2
                    className="text-3xl md:text-5xl font-bold mb-4"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    Our Collection
                </motion.h2>

                <motion.p
                    className="text-gray-600 mb-12 text-base md:text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    Choose your perfect keychain. Each one comes with a unique QR <br />code and inspirational quote.
                </motion.p>

                {/* Carousel */}
                <div className="relative w-full  flex items-center justify-center">
                    {/* Left Arrow */}
                    <button
                        aria-label="Previous slide"
                        onClick={prevSlide}
                        className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow hover:scale-110 transition-transform duration-300"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-800" />
                    </button>

                    {/* Image Wrapper */}
                    <div className="overflow-hidden rounded-lg w-full md:w-[92%] mx-auto">
                        <motion.div
                            key={currentIndex}
                            initial={{ x: 80, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -80, opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="flex justify-center gap-4 sm:gap-6"
                        >
                            {visibleImages.map((src, i) => (
                                <div
                                    key={`${src}-${i}`}
                                    className="flex-shrink-0 w-[45%] sm:w-1/3 md:w-1/4 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transform hover:scale-[1.03] transition-all duration-300 ease-in-out"
                                >
                                    <Image
                                        src={src}
                                        alt={`Keychain ${i + 1}`}
                                        width={400}
                                        height={400}
                                        className="rounded-2xl object-cover w-full h-auto grayscale hover:grayscale-0 transition duration-300"
                                    />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right Arrow */}
                    <button
                        aria-label="Next slide"
                        onClick={nextSlide}
                        className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow hover:scale-110 transition-transform duration-300"
                    >
                        <ArrowRight className="w-5 h-5 text-gray-800" />
                    </button>
                </div>

                {/* Dots */}
                <div className="flex justify-center mt-8 space-x-2">
                    {Array.from({ length: totalImages }).map((_, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all ${isActive ? "bg-black scale-110" : "bg-gray-300"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
