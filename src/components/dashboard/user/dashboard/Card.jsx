'use client';

export default function Card({ children, className = '' }) {
  return (
    <div
      className={`
        rounded-2xl
        bg-white/75 dark:bg-slate-900/50
        backdrop-blur-md dark:backdrop-blur-lg
        border border-white/80 dark:border-white/[0.12]
        shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_4px_20px_-4px_rgba(0,0,0,0.05)]
        dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_30px_rgba(0,0,0,0.22)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
