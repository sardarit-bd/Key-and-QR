"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Calendar, Clock, Crown, Bell } from "lucide-react";
import Link from "next/link";

function getTimeUntilMidnight() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow - now;
}

function formatCountdown(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
    };
}

export default function LimitReachedScreen({ dailyLimit = 1 }) {
    const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());
    const [notified, setNotified] = useState(false);
    const [notifyLoading, setNotifyLoading] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeUntilMidnight());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const { hours, minutes, seconds } = formatCountdown(timeLeft);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    const handleNotifyMe = async () => {
        setNotifyLoading(true);
        try {
            // Placeholder — backend endpoint not yet implemented
            await new Promise((r) => setTimeout(r, 500));
            setNotified(true);
        } catch {
            // Silent fail
        } finally {
            setNotifyLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0c1a] to-[#131630] p-4">
            <div className="bg-[#121526] border border-white/5 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                {/* Icon */}
                <div className="w-20 h-20 bg-gradient-to-r from-[#e3ba85] to-[#c9965a] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock size={32} className="text-black" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-white mb-2">
                    Come Back Tomorrow
                </h1>
                <p className="text-gray-400 mb-6">
                    You&apos;ve used all {dailyLimit} unlocks for today.
                </p>

                {/* Countdown Timer */}
                <div className="bg-white/5 rounded-xl p-6 mb-6">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Next quote available in</p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-[#e3ba85] tabular-nums font-mono">{hours}</div>
                            <div className="text-[10px] text-gray-500 uppercase mt-1">Hours</div>
                        </div>
                        <span className="text-2xl text-gray-600 font-mono">:</span>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-[#e3ba85] tabular-nums font-mono">{minutes}</div>
                            <div className="text-[10px] text-gray-500 uppercase mt-1">Min</div>
                        </div>
                        <span className="text-2xl text-gray-600 font-mono">:</span>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-[#e3ba85] tabular-nums font-mono">{seconds}</div>
                            <div className="text-[10px] text-gray-500 uppercase mt-1">Sec</div>
                        </div>
                    </div>
                </div>

                {/* Next Available Date */}
                <div className="bg-white/5 rounded-lg p-3 mb-6 flex items-center gap-2 text-sm text-gray-300">
                    <Calendar size={16} className="text-[#e3ba85]" />
                    <span>Next available: <span className="font-medium text-white">{tomorrowFormatted}</span></span>
                </div>

                {/* Notify Me Button */}
                <button
                    onClick={handleNotifyMe}
                    disabled={notified || notifyLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Bell size={18} />
                    {notified ? "We'll notify you!" : notifyLoading ? "Setting up..." : "Notify Me When Ready"}
                </button>

                {/* Go Premium CTA */}
                <Link
                    href="/new-dashboard/user/premium"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#e3ba85] to-[#c9965a] text-black rounded-xl font-semibold hover:from-[#d4a976] hover:to-[#b88a4e] transition"
                >
                    <Crown size={18} />
                    Go Premium for Unlimited
                </Link>

                {/* Return Home */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 mt-6 text-sm text-gray-400 hover:text-white transition"
                >
                    Return Home
                    <ArrowRight size={14} />
                </Link>

                <p className="text-xs text-gray-600 mt-6">
                    Each InspireTag gives you {dailyLimit} free unlock per day
                </p>
            </div>
        </div>
    );
}
