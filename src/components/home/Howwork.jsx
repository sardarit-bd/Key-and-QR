"use client";

import { ShoppingCart, QrCode, Sparkles } from "lucide-react";

export default function Howwork() {
    const steps = [
        {
            id: "01",
            icon: ShoppingCart,
            title: "Choose Your Keychain",
            desc: "Select from our premium collection and add an optional gift message.",
        },
        {
            id: "02",
            icon: QrCode,
            title: "Receive Your QR Code",
            desc: "Get a unique QR code instantly after purchase, engraved on your keychain.",
        },
        {
            id: "03",
            icon: Sparkles,
            title: "Scan & Be Inspired",
            desc: "Scan the QR code anytime to reveal your personalized motivational quote.",
        },
    ];

    return (
        <section className="bg-gray-50 text-black py-20">
            <div className="container mx-auto px-6 text-center">
                {/* Heading */}
                <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
                <p className="text-gray-600 mb-16 text-base md:text-lg">
                    Three simple steps to carry inspiration wherever you go
                </p>

                {/* Steps */}
                <div className="relative flex flex-col md:flex-row items-center justify-center gap-12 md:gap-6">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={index}
                                className="relative flex flex-col items-center text-center max-w-xs"
                            >
                                {/* Connector line */}
                                {index !== steps.length - 1 && (
                                    <div className="hidden md:block absolute top-[1.5rem] left-[60%] w-[100%] h-[2px] bg-gray-300 z-0"></div>
                                )}

                                {/* Icon with number */}
                                <div className="relative z-10 mb-6">
                                    <div className="bg-gray-700 text-white w-14 h-14 flex items-center justify-center rounded-lg shadow-md">
                                        <Icon size={24} />
                                    </div>
                                    <span className="absolute -top-2 -right-2 bg-white border text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center shadow">
                                        {step.id}
                                    </span>
                                </div>

                                {/* Text */}
                                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
