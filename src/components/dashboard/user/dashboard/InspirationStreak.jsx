"use client";

import { Check } from "lucide-react";
import Card from "./Card";

const DAYS = [
  { day: "M", active: true },
  { day: "T", active: true },
  { day: "W", active: true },
  { day: "T", active: true },
  { day: "F", active: true },
  { day: "S", active: true },
  { day: "S", active: false },
];

export default function InspirationStreak({ streak = 7 }) {
  return (
    <Card className="relative overflow-hidden rounded-[26px] border border-[#4d3523]  p-6 h-full">
      {/* Background Glow */}
      {/* <div className="absolute inset-0">
        <div className="absolute left-1/2 top-[45%] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffb86a]/10 blur-[120px]" />
        <div className="absolute bottom-10 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-[#ff9f43]/10 blur-[80px]" />
      </div> */}

      <div className="relative z-10 flex h-full flex-col items-center">
        <h2 className="text-[34px] font-serif text-[#f3ede6]">
          Inspiration Streak
        </h2>

        <div className="relative mt-8 flex h-[220px] w-[220px] items-center justify-center">
          <div className="absolute h-[170px] w-[170px] rounded-full bg-[#ffb45d]/20 blur-[20px]" />

          <div className="absolute h-[155px] w-[155px] rounded-full bg-[#0d111b] blur-[3px]  z-20" />

          <svg
            className="absolute inset-0 -rotate-90 z-10"
            viewBox="0 0 220 220"
          >
            <defs>
              <filter
                id="eclipseGlow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />{" "}
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient
                id="eclipseGradient"
                x1="100%"
                y1="50%"
                x2="0%"
                y2="50%"
              >
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="15%" stopColor="#ffb45d" />
                <stop offset="100%" stopColor="#7a4616" />
              </linearGradient>
            </defs>

            <circle
              cx="110"
              cy="110"
              r="82"
              fill="none"
              stroke="rgba(255,190,120,.10)"
              strokeWidth="1.5"
            />
            <circle
              cx="110"
              cy="110"
              r="82"
              fill="none"
              stroke="url(#eclipseGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="515"
              strokeDashoffset="25"
              filter="url(#eclipseGlow)"
            />
            <circle
              cx="192"
              cy="110"
              r="2.5"
              fill="#ffffff"
              filter="url(#eclipseGlow)"
            />
          </svg>

          {/* Center Text */}
          <div className="relative z-20 text-center">
            <h1 className="font-serif text-[88px] leading-none text-[#ffb45d] drop-shadow-[0_0_12px_rgba(255,180,93,0.3)]">
              {streak || 7}
            </h1>
            <p className="mt-2 font-serif text-[20px] text-[#ffb45d] drop-shadow-[0_0_8px_rgba(255,180,93,0.3)]">
              Days
            </p>
          </div>
        </div>

        <p className="mt-6 font-serif text-[20px] text-[#efe8df]">
          Keep your streak going!
        </p>

        <div className="mt-8 w-full rounded-[18px] bg-[#121722]/90 px-5 py-4">
          <div className="flex justify-between">
            {DAYS.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <span className="text-sm text-[#ece8e2]">{item.day}</span>

                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                    item.active
                      ? "border-[#f3b25f] bg-[#f3b25f]"
                      : "border-[#5b5d66] bg-transparent"
                  }`}
                >
                  {item.active && (
                    <Check
                      size={14}
                      strokeWidth={3}
                      className="text-[#0d1018]"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
