'use client';

import Card from "./Card";

export default function StatCard({
 icon: Icon,
 title,
 value,
 subtitle,
 colorTheme,
 customIconRender,
}) {
 const themeMap = {
 purple: {
 border: "border-purple-500/30",
 bg: "bg-purple-900/20",
 icon: "text-purple-400",
 glow: "shadow-[0_0_15px_rgba(168,85,247,0.1)]",
 },
 pink: {
 border: "border-pink-500/30",
 bg: "bg-pink-900/20",
 icon: "text-pink-400",
 glow: "shadow-[0_0_15px_rgba(244,114,182,0.15)]",
 },
 blue: {
 border: "border-info/30",
 bg: "bg-info/10",
 icon: "text-info",
 glow: "shadow-[0_0_15px_rgba(140,166,235,0.1)]",
 },
 gold: {
 border: "border-accent/30",
 bg: "bg-accent/10",
 icon: "text-accent",
 glow: "shadow-[0_0_15px_rgba(227,186,133,0.15)]",
 },
 };

 const theme = themeMap[colorTheme] || themeMap.purple;

 return (
 <Card className="p-4 sm:p-5 md:p-6 hover:bg-background-secondary transition-colors cursor-default cursor-pointer">
 <div className="flex items-center justify-between gap-4 sm:gap-5 px-10">
 <div className={`relative w-[44px] sm:w-[48px] md:w-[52px] h-[44px] sm:h-[48px] md:h-[52px] rounded-full border ${theme.border} ${theme.bg} ${theme.glow} flex items-center justify-center flex-shrink-0`}>
 {customIconRender ? (
 customIconRender()
 ) : (
 <Icon size={22} className={`w-[18px] h-[18px] sm:w-5 sm:h-5 md:w-[22px] md:h-[22px] ${theme.icon}`} />
 )}
 </div>

 <div className="text-center">
 <p className="text-foreground-secondary text-[10px] sm:text-[11px] md:text-xs font-medium">
 {title}
 </p>

 <h3 className="text-[22px] sm:text-[24px] md:text-[28px] leading-tight text-foreground">
 {value}
 </h3>

 <p className="text-foreground-tertiary text-[10px] sm:text-[11px]">
 {subtitle}
 </p>
 </div>
 </div>
 </Card>
 );
}
