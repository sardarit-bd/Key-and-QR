'use client';

export default function Card({ children, className = '' }) {
  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-2xl
        bg-card
        border border-border/50
        shadow-sm
        ${className}
      `}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
