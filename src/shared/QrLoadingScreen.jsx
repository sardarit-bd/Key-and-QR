"use client";

import { useEffect, useState } from "react";
import { QrCode, Scan, Sparkles } from "lucide-react";

export default function QrLoadingScreen({
    message = "Opening your InspireTag...",
    tagCode = null,
    onComplete = null,
    duration = 3000
}) {
    const [progress, setProgress] = useState(0);
    const [scanning, setScanning] = useState(true);

    useEffect(() => {
        // Progress animation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setScanning(false);
                    if (onComplete) setTimeout(onComplete, 500);
                    return 100;
                }
                return prev + 2;
            });
        }, duration / 50);

        return () => clearInterval(interval);
    }, [duration, onComplete]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
            <div className="relative max-w-md w-full">
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />

                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-white/20">
                    {/* Animated QR Code Container */}
                    <div className="relative mb-8 flex justify-center">
                        <div className="relative">
                            {/* Outer ring animation */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 animate-ping opacity-75" />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />

                            {/* QR Code Box */}
                            <div className="relative bg-white rounded-xl p-4 shadow-lg">
                                <div className="relative">
                                    {/* QR Code SVG */}
                                    <svg
                                        width="120"
                                        height="120"
                                        viewBox="0 0 120 120"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="relative z-10"
                                    >
                                        {/* QR Code Pattern - Dynamic with scanning effect */}
                                        <rect x="20" y="20" width="80" height="80" fill="white" stroke="#9333EA" strokeWidth="2" />

                                        {/* Position Markers */}
                                        <rect x="25" y="25" width="20" height="20" fill="#9333EA" />
                                        <rect x="75" y="25" width="20" height="20" fill="#9333EA" />
                                        <rect x="25" y="75" width="20" height="20" fill="#9333EA" />
                                        <rect x="75" y="75" width="20" height="20" fill="#9333EA" />

                                        {/* Inner position markers */}
                                        <rect x="30" y="30" width="10" height="10" fill="white" />
                                        <rect x="80" y="30" width="10" height="10" fill="white" />
                                        <rect x="30" y="80" width="10" height="10" fill="white" />
                                        <rect x="80" y="80" width="10" height="10" fill="white" />

                                        {/* Random QR pattern */}
                                        {Array.from({ length: 20 }).map((_, i) => {
                                            const x = 45 + (i % 5) * 6;
                                            const y = 45 + Math.floor(i / 5) * 6;
                                            return (
                                                <rect
                                                    key={i}
                                                    x={x}
                                                    y={y}
                                                    width="4"
                                                    height="4"
                                                    fill={Math.random() > 0.5 ? "#9333EA" : "#C084FC"}
                                                />
                                            );
                                        })}

                                        {/* Scanning Line Animation */}
                                        <rect
                                            x="20"
                                            y={20 + (progress / 100) * 80}
                                            width="80"
                                            height="3"
                                            fill="#EC489A"
                                            className="transition-all duration-100"
                                            style={{ opacity: 0.8 }}
                                        />
                                    </svg>

                                    {/* Scanning line glow */}
                                    <div
                                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent"
                                        style={{
                                            top: `${(progress / 100) * 100}%`,
                                            transition: "top 0.1s linear",
                                            boxShadow: "0 0 10px #EC489A",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Scan icon overlay */}
                        {scanning && (
                            <div className="absolute -bottom-2 -right-2 bg-purple-500 rounded-full p-2 animate-bounce">
                                <Scan size={20} className="text-white" />
                            </div>
                        )}
                    </div>

                    {/* Tag Code Display */}
                    {tagCode && (
                        <div className="mb-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                                <QrCode size={14} className="text-purple-600" />
                                <span className="text-xs font-mono text-purple-700">{tagCode}</span>
                            </div>
                        </div>
                    )}

                    {/* Message */}
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        {scanning ? "Scanning your InspireTag..." : "Almost there..."}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Animated dots */}
                    <div className="flex justify-center gap-1 mt-4">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"
                                style={{ animationDelay: `${i * 0.2}s` }}
                            />
                        ))}
                    </div>

                    {/* Decorative sparkles */}
                    <div className="absolute top-4 right-4">
                        <Sparkles size={16} className="text-purple-300 animate-pulse" />
                    </div>
                    <div className="absolute bottom-4 left-4">
                        <Sparkles size={12} className="text-pink-300 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}