"use client";

import { motion } from "framer-motion";
import { Crown, QrCode, Sparkles } from "lucide-react";

const features = [
    {
        icon: QrCode,
        title: "Auto QR Generation",
        desc: `Every keychain comes with a unique QR code that links to an inspirational quote.`,
        direction: "left",
    },
    {
        icon: Sparkles,
        title: "Quote Personalization",
        desc: "Each scan reveals a carefully curated motivational message to brighten your day.",
        direction: "bottom",
    },
    {
        icon: Crown,
        title: "Premium Subscription",
        desc: "Unlock categorized quotes: Motivation, Love, Gratitude, Faith, Joy, and Random.",
        direction: "right",
    },
];

export default function Why() {
    return (
        <section className="bg-white text-black py-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 text-center">
                {/* Heading */}
                <motion.h2
                    className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    Why Choose KeyChain?
                </motion.h2>

                <motion.p
                    className="text-gray-600 text-base sm:text-lg md:text-xl leading-relaxed mb-14"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    More than just a keychain – it's a daily reminder of what <br /> matters most
                </motion.p>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mt-8 text-left py-4">
                    {features.map((item, index) => {
                        const Icon = item.icon;

                        const variants = {
                            left: { initial: { opacity: 0, x: -100 }, animate: { opacity: 1, x: 0 } },
                            bottom: { initial: { opacity: 0, y: 100 }, animate: { opacity: 1, y: 0 } },
                            right: { initial: { opacity: 0, x: 100 }, animate: { opacity: 1, x: 0 } },
                        };

                        return (
                            <motion.div
                                key={index}
                                initial={variants[item.direction].initial}
                                whileInView={variants[item.direction].animate}
                                transition={{
                                    type: "tween",
                                    stiffness: 60,
                                    damping: 10,
                                    duration: 0.6,
                                    delay: index * 0.1,
                                }}
                                viewport={{ once: true }}
                                className="bg-gray-50  hover:bg-gray-100 rounded-2xl p-8 sm:p-10  shadow-sm hover:shadow-lg transform hover:scale-[1.03] transition-all duration-300 ease-in-out"
                            >
                                <div className="bg-white text-left w-14 h-14 flex items-center justify-center rounded-xl shadow mb-6">
                                    <Icon size={28} className="text-gray-800" />
                                </div>
                                <h3 className="text-lg md:text-xl text-gray-800 font-semibold mb-2 mt-6">{item.title}</h3>
                                <p className="text-gray-600 text-sm sm:text-base max-w-[320px] leading-relaxed mt-6">{item.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
