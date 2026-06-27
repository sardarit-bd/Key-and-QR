'use client';

export default function Card({ children, className = '' }) {
  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-[22px]
        shadow-[0_10px_40px_rgba(0,0,0,0.35)]
        ${className}
      `}
    >
      {/* Top Left Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#E3BA85]/5 blur-3xl" />

      {/* Bottom Right Glow */}
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />

      {/* Inner Border */}
      <div className="pointer-events-none absolute inset-[1px] rounded-[21px] border border-white/[0.03]" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}