'use client';

export default function CategoryCard({ icon: Icon, label, subtitle, colorClass, isActive }) {
  if (isActive) {
    return (
      <button className="flex flex-col items-center justify-center gap-1.5 px-6 py-3.5 rounded-xl bg-[#2a1b41]/30 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] min-w-[90px] transition-all">
        <Icon size={20} className="text-[#e3ba85]" />
        <span className="text-white text-sm font-medium">{label}</span>
        {subtitle && <span className="text-[#a1a1aa] text-[10px]">{subtitle}</span>}
      </button>
    );
  }

  return (
    <button className="flex flex-col items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl bg-[#151722] border border-[#1e2235] hover:bg-[#1a1d29] transition-colors min-w-[90px]">
      <Icon size={20} className={colorClass} />
      <span className="text-gray-300 text-sm font-medium">{label}</span>
      {subtitle && <span className="text-transparent text-[10px]">{subtitle}</span>} {/* Spacer for alignment */}
    </button>
  );
}