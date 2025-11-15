"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
    return (
        <section className="bg-white text-black py-16 md:py-24 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center justify-between gap-10">

                {/* Left Content */}
                <motion.div
                    className="w-full md:w-1/2 space-y-6 text-center md:text-left"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold uppercase leading-tight md:leading-[80px]">
                        Create Your Story <br className="hidden sm:block" /> in a Keychain
                    </h1>

                    <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto md:mx-0">
                        Every keychain carries a hidden message of hope, love, or joy — revealed only when scanned.
                    </p>

                    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Link
                            href="#"
                            className="px-6 py-3 bg-gray-800 text-white rounded-md font-medium hover:bg-gray-900 transition"
                        >
                            Start Your Story Now
                        </Link>
                        <Link
                            href="#"
                            className="px-6 py-3 border border-black text-black rounded-md font-medium hover:bg-gray-700 hover:text-white transition"
                        >
                            How It Works
                        </Link>
                    </div>
                </motion.div>

                {/* Right Image */}
                <motion.div
                    className="w-full md:w-1/2 flex justify-center md:justify-end"
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <div className="relative w-full max-w-[500px] sm:max-w-[600px]">
                        <Image
                            src="/home/hero.png"
                            alt="Hero Image"
                            width={600}
                            height={400}
                            className="rounded-xl shadow-lg grayscale hover:grayscale-0 transition w-full h-auto"
                            priority
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
