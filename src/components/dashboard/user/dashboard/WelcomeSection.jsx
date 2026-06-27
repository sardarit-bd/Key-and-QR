'use client';

export default function WelcomeSection({ userName = "Dd" }) {
  return (
    <div className="flex flex-col justify-center h-full py-4">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white tracking-wide mb-3 flex items-center gap-2">
        Good Evening, {userName}! <span className="text-[#e3ba85]">✨</span>
      </h1>
      <p className="text-[#a1a1aa] text-sm md:text-base">
        Welcome back to your inspiration journey.
      </p>
    </div>
  );
}