"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";

const testimonials = [
    {
        id: 1,
        name: "Eleanor Pena",
        title: "CEO, Abstergo Ltd.",
        image: "/home/boy.png",
        quote:
            "This keychain was the perfect gift! The personalized quote brought tears to my eyes — it felt so thoughtful and meaningful.",
        rating: 5,
    },
    {
        id: 2,
        name: "Jenny Wilson",
        title: "Software Engineer",
        image: "/home/girl.png",
        quote:
            "I gifted this to my best friend, and she got emotional after scanning the QR. The quote felt so personal — it made the moment special.",
        rating: 5,
    },
    {
        id: 3,
        name: "Albert Flores",
        title: "CEO, Acme Co.",
        image: "/home/man.png",
        quote:
            "A simple idea that carries so much emotion. The design, the message, everything was beautifully executed. Highly recommended!",
        rating: 5,
    },
];

export default function Testimonial() {
    const [index, setIndex] = useState(1);

    const nextSlide = () => setIndex((prev) => (prev + 1) % testimonials.length);
    const prevSlide = () =>
        setIndex((prev) =>
            prev === 0 ? testimonials.length - 1 : (prev - 1) % testimonials.length
        );

    const current = testimonials[index];
    const prev = testimonials[(index - 1 + testimonials.length) % testimonials.length];
    const next = testimonials[(index + 1) % testimonials.length];

    return (
        <section className="bg-white text-black py-20 overflow-hidden">
            <div className="container mx-auto px-6 text-center relative">
                {/* Heading */}
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                    What Our Client Say
                </h2>
                <p className="text-gray-600 mb-16">
                    See what our customers are saying about their StoryChain experience
                </p>

                {/* Slider Area */}
                <div className="relative flex items-center justify-center">
                    {/* Left Arrow */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-[200px] md:left-[305px] top-0 z-20 bg-white p-3 rounded-lg border-2 border-gray-100 hover:scale-110 transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-800" />
                    </button>

                    {/* Slider */}
                    <div className="flex items-center justify-center gap-6">
                        {/* Before (Previous Person) */}
                        <motion.div
                            key={prev.id + "before"}
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 0.5, x: 0, scale: 0.95 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="hidden md:block w-[180px] absolute left-0 bottom-0 rounded-xl overflow-hidden shadow-sm"
                        >
                            <Image
                                src={prev.image}
                                alt={prev.name}
                                width={200}
                                height={200}
                                className="rounded-xl object-cover"
                            />
                            <div className="absolute bottom-2 left-2 text-left text-white text-sm z-10">
                                <p className="font-semibold">{prev.name}</p>
                                <p className="text-xs opacity-80">{prev.title}</p>
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-xl" />
                        </motion.div>

                        {/* Active (Main Testimonial) */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.5 }}
                                className="bg-gray-50 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 max-w-3xl shadow-md"
                            >
                                <div className="flex-shrink-0">
                                    <Image
                                        src={current.image}
                                        alt={current.name}
                                        width={220}
                                        height={220}
                                        className="rounded-xl object-cover"
                                    />
                                </div>

                                <div className="text-left">
                                    <Quote className="text-gray-400 mb-3" size={32} />
                                    <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">
                                        {current.quote}
                                    </p>

                                    <div className="flex gap-1 mb-2">
                                        {Array.from({ length: current.rating }).map((_, i) => (
                                            <span key={i} className="text-yellow-400 text-lg">★</span>
                                        ))}
                                    </div>

                                    <h4 className="font-semibold text-lg">{current.name}</h4>
                                    <p className="text-gray-500 text-sm">{current.title}</p>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* After (Next Person) */}
                        <motion.div
                            key={next.id + "after"}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 0.5, x: 0, scale: 0.95 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute right-0 top-0 hidden md:block w-[180px] rounded-xl overflow-hidden shadow-sm"
                        >
                            <Image
                                src={next.image}
                                alt={next.name}
                                width={200}
                                height={200}
                                className="rounded-xl object-cover"
                            />
                            <div className="absolute bottom-2 left-2 text-left text-white text-sm z-10">
                                <p className="font-semibold">{next.name}</p>
                                <p className="text-xs opacity-80">{next.title}</p>
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-xl" />
                        </motion.div>
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={nextSlide}
                        className="absolute right-[200px] md:right-[305px] bottom-0 z-20 bg-white p-3 rounded-lg border-2 border-gray-100 hover:scale-110 transition"
                    >
                        <ArrowRight className="w-5 h-5 text-gray-800" />
                    </button>
                </div>
            </div>
        </section>
    );
}
