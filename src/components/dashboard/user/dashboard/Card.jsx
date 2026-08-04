'use client';

export default function Card({ children, className = '' }) {
  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-[22px]
        bg-card
        border border-white/6
        shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)]
        ${className}
      `}
    >
      {/* Top Left Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/[0.04] blur-3xl" />

      {/* Bottom Right Glow */}
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent/[0.04] blur-3xl" />

      {/* Inner highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
