"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, CheckCircle, ShoppingBag, QrCode, Scan, Sparkles } from "lucide-react";

export default function Hero() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const steps = [
        {
            id: 1,
            title: "Choose Your Keychain",
            description: "Select from our premium collection and add an optional gift message.",
            icon: ShoppingBag,
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            id: 2,
            title: "Receive Your QR Code",
            description: "Get a unique QR code instantly after purchase, engraved on your keychain.",
            icon: QrCode,
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600",
        },
        {
            id: 3,
            title: "Scan & Be Inspired",
            description: "Scan the QR code anytime to reveal your personalized motivational quote.",
            icon: Scan,
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
        },
    ];

    return (
        <>
            <section className="bg-white text-black py-16 md:py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 flex flex-col-reverse md:flex-row items-center justify-between gap-10">

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
                                href="/signup"
                                className="px-6 py-3 bg-gray-800 text-white rounded-md font-medium hover:bg-gray-900 transition"
                            >
                                Start Your Story Now
                            </Link>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-3 border border-black text-black rounded-md font-medium hover:bg-gray-700 hover:text-white transition"
                            >
                                How It Works
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
                        <div className="relative w-full h-full">
                            <Image
                                src="/home/keychain.png"
                                alt="Hero Image"
                                width={1000}
                                height={1000}
                                className="w-full h-full"
                                priority
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* How It Works Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="relative bg-gray-900 text-white px-6 py-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Sparkles size={24} className="text-gray-400" />
                                        <h2 className="text-2xl font-bold">How It Works</h2>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 hover:bg-gray-800 rounded-full transition cursor-pointer"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-gray-400 text-sm mt-1">
                                    Three simple steps to carry inspiration wherever you go
                                </p>
                            </div>

                            {/* Modal Body - Steps */}
                            <div className="p-6 md:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {steps.map((step, index) => {
                                        const IconComponent = step.icon;
                                        return (
                                            <motion.div
                                                key={step.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="text-center group border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition cursor-pointer"
                                            >
                                                {/* Step Number Badge with Color */}
                                                <div className="relative mb-4">
                                                    <div className={`w-16 h-16 mx-auto ${step.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-105 transition`}>
                                                        <IconComponent size={28} className={step.iconColor} />
                                                    </div>
                                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                        {step.id}
                                                    </div>
                                                </div>

                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {step.title}
                                                </h3>
                                                <p className="text-gray-500 text-sm leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Decorative Line */}
                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <div className="bg-gray-100 rounded-full p-2">
                                            <CheckCircle size={20} className="text-gray-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* CTA Button - Redirects to Signup */}
                                <div className="text-center">
                                    <Link
                                        href="/signup"
                                        onClick={() => setIsModalOpen(false)}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
                                    >
                                        Start Your Story Now
                                        <Sparkles size={16} />
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