'use client';

export default function Card({ children, className = '' }) {
  return (
    <div
      className={`
        rounded-2xl
        bg-card
        border border-border
        shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}
