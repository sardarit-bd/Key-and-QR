'use client';

export default function CategoryCard({
  icon: Icon,
  label,
  subtitle,
  colorClass,
  isActive,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex 
        h-[72px] sm:h-[80px] md:h-[88px] 
        w-[78px] sm:w-[85px] md:w-[94px] 
        flex-col items-center justify-center 
        overflow-hidden rounded-[14px] sm:rounded-[16px] md:rounded-[18px] 
        border transition-all duration-300
        flex-shrink-0
        ${isActive 
          ? `border-violet-500/60 bg-gradient-to-b from-[#4a2a6a] via-[#2a1a45] to-[#1a1a2a] shadow-[0_0_30px_rgba(168,85,247,0.3)] scale-[1.02] ring-1 ring-violet-500/30`
          :
            `border-[#2A2F3E] bg-gradient-to-b from-[#1A1D27] to-[#12151D] hover:-translate-y-0.5 hover:border-[#3C4154]
            hover:bg-[#1B1F29] hover:shadow-lg`
        }
      `}
    >
      {/* Active Glow Effect */}
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-[18px] bg-violet-500/20 blur-xl" />
          <div className="absolute inset-[1px] rounded-[17px] border border-violet-500/20" />
        </>
      )}

      {/* Inactive Hover Glow */}
      {!isActive && (
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 rounded-[18px] bg-white/[0.02]" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <Icon
          size={20}
          strokeWidth={2.2}
          className={`
            w-4 h-4 sm:w-[18px] sm:h-[18px] md:w-5 md:h-5
            transition-all duration-300
            ${isActive 
              ? 'text-[#E6BE84]' 
              : colorClass || 'text-gray-400'
            }
          `}
        />

        <span 
          className={`
            mt-1.5 sm:mt-2 
            text-[11px] sm:text-[12px] md:text-[13px] 
            font-semibold transition-all duration-300
            ${isActive 
              ? 'text-white' 
              : 'text-[#ECEEF3]'
            }
          `}
        >
          {label}
        </span>

        {subtitle ? (
          <span 
            className={`
              mt-0.5 
              text-[10px] sm:text-[11px] 
              transition-all duration-300
              ${isActive 
                ? 'text-[#A8ABB6]' 
                : 'text-[#8E919C]'
              }
            `}
          >
            {subtitle}
          </span>
        ) : (
          <span className="mt-0.5 invisible text-[11px]">
            Spacer
          </span>
        )}
      </div>
    </button>
  );
}