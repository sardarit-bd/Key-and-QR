'use client';

export default function Card({ children, className = '' }) {
  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-[22px]
        bg-card
        shadow-lg
        ${className}
      `}
    >
      {/* Top Left Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

      {/* Bottom Right Glow */}
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />

      {/* Inner Border */}
      <div className="pointer-events-none absolute inset-[1px] rounded-[21px] border border-border/50" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
