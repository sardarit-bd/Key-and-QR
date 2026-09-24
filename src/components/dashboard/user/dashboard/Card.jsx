'use client';

export default function Card({ children, className = '' }) {
  return (
    <div
      className={`
        rounded-2xl
        bg-white/75 dark:bg-neutral-900/70
        backdrop-blur-md dark:backdrop-blur-xl
        border border-white/80 dark:border-white/[0.08]
        shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_4px_20px_-4px_rgba(0,0,0,0.05)]
        dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.35)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
