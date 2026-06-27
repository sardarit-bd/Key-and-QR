'use client';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-[#0e111a] border border-[#1a1e2d] rounded-2xl ${className}`}>
      {children}
    </div>
  );
}