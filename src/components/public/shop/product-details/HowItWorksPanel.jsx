"use client";

/**
 * HowItWorksPanel — 3-step explainer.
 */
const STEPS = [
  ["1", "Scan your tag", "Use your phone's camera or NFC to scan your MyInspireTag."],
  ["2", "Receive a message", "A personalized quote or message is revealed instantly."],
  ["3", "Share & save", "Save favorites, gift messages, and share with the people you love."],
];

export default function HowItWorksPanel() {
  return (
    <div>
      <h3 className="text-lg font-bold tracking-tight text-[#2E2A24]">How It Works</h3>
      <ol className="mt-4 space-y-4">
        {STEPS.map(([num, title, desc]) => (
          <li key={num} className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5EDDC] text-[13px] font-bold text-[#A6782B]">
              {num}
            </span>
            <div>
              <p className="text-[14px] font-semibold text-[#2E2A24]">{title}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-[#8A7A5C]">{desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
