'use client';

export default function CategoryCard({
  icon: Icon,
  label,
  subtitle,
  colorClass,
  isActive,
  isLocked,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`
        relative flex 
        h-[72px] sm:h-[80px] md:h-[88px] 
        w-[78px] sm:w-[85px] md:w-[94px] 
        flex-col items-center justify-center 
        overflow-hidden rounded-[14px] sm:rounded-[16px] md:rounded-[18px] 
        border transition-all duration-300
        flex-shrink-0
        ${isLocked 
          ? 'border-border bg-gradient-to-b from-card to-background-secondary opacity-70 cursor-not-allowed'
          : isActive 
            ? `border-primary/60 bg-gradient-to-b from-primary/20 via-primary/10 to-background shadow-[0_0_30px_rgba(168,85,247,0.3)] scale-[1.02] ring-1 ring-primary/30`
            :
              `border-border bg-gradient-to-b from-card to-background-secondary hover:-translate-y-0.5 hover:border-primary/30
              hover:bg-muted hover:shadow-lg`
        }
      `}
    >
      {/* Active Glow Effect */}
      {isActive && !isLocked && (
        <>
          <div className="absolute inset-0 rounded-[18px] bg-primary/20 blur-xl" />
          <div className="absolute inset-[1px] rounded-[17px] border border-primary/20" />
        </>
      )}

      {/* Inactive Hover Glow */}
      {!isActive && !isLocked && (
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 rounded-[18px] bg-foreground/[0.02]" />
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
            ${isLocked 
              ? 'text-muted-foreground' 
              : isActive 
                ? 'text-accent' 
                : colorClass || 'text-muted-foreground'
            }
          `}
        />

        <span 
          className={`
            mt-1.5 sm:mt-2 
            text-[11px] sm:text-[12px] md:text-[13px] 
            font-semibold transition-all duration-300
            ${isActive 
              ? 'text-foreground' 
              : 'text-foreground'
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
                ? 'text-foreground-secondary' 
                : 'text-foreground-secondary'
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
