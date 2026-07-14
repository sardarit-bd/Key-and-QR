export const ADMIN_DASHBOARD_THEME = {
    id: 'admin-dashboard',
    name: 'Admin Dashboard Theme',
    isDark: true,
    
    // Enterprise, Data-Driven, Professional Color System
    colors: {
      // Backgrounds - Dark enterprise
      background: 'oklch(0.06 0.01 260)',
      backgroundSecondary: 'oklch(0.09 0.01 260)',
      backgroundTertiary: 'oklch(0.12 0.01 260)',
      
      // Foregrounds - Clean white
      foreground: 'oklch(0.95 0 0)',
      foregroundSecondary: 'oklch(0.65 0.02 260)',
      foregroundTertiary: 'oklch(0.45 0.02 260)',
      
      // Primary - Professional blue
      primary: 'oklch(0.6 0.2 250)',
      primaryForeground: 'oklch(0.98 0 0)',
      primaryGradient: 'linear-gradient(135deg, oklch(0.5 0.25 250), oklch(0.4 0.25 270))',
      
      // Secondary - Muted blue
      secondary: 'oklch(0.15 0.05 250)',
      secondaryForeground: 'oklch(0.7 0.15 250)',
      
      // Accent - Teal for highlights
      accent: 'oklch(0.5 0.2 190)',
      accentForeground: 'oklch(0.98 0 0)',
      
      // Muted - Subtle
      muted: 'oklch(0.15 0.01 260)',
      mutedForeground: 'oklch(0.55 0.02 260)',
      
      // Destructive
      destructive: 'oklch(0.577 0.245 27.325)',
      destructiveForeground: 'oklch(0.985 0 0)',
      
      // Borders - Subtle
      border: 'oklch(0.18 0.01 260)',
      input: 'oklch(0.18 0.01 260)',
      ring: 'oklch(0.6 0.2 250)',
      
      // Cards - Dark
      card: 'oklch(0.09 0.01 260)',
      cardForeground: 'oklch(0.95 0 0)',
      
      // Popover
      popover: 'oklch(0.09 0.01 260)',
      popoverForeground: 'oklch(0.95 0 0)',
      
      // Sidebar - Darker
      sidebar: 'oklch(0.04 0.01 260)',
      sidebarForeground: 'oklch(0.85 0 0)',
      sidebarPrimary: 'oklch(0.6 0.2 250)',
      sidebarPrimaryForeground: 'oklch(0.98 0 0)',
      sidebarAccent: 'oklch(0.15 0.05 250)',
      sidebarAccentForeground: 'oklch(0.7 0.15 250)',
      sidebarBorder: 'oklch(0.12 0.01 260)',
      sidebarRing: 'oklch(0.6 0.2 250)',
      
      // Charts - Professional
      chart1: 'oklch(0.6 0.2 250)',
      chart2: 'oklch(0.5 0.2 190)',
      chart3: 'oklch(0.7 0.2 80)',
      chart4: 'oklch(0.5 0.2 330)',
      chart5: 'oklch(0.6 0.2 30)',
    },
    
    // Typography - Clean, Professional
    typography: {
      fontFamily: 'var(--font-inter)',
      headingFont: 'var(--font-inter)',
      monoFont: 'var(--font-geist-mono)',
      baseSize: '14px',
      scale: 1.2,
    },
    
    // Spacing - Compact
    spacing: {
      radius: '0.5rem',
      radiusSm: 'calc(var(--radius) * 0.6)',
      radiusMd: 'calc(var(--radius) * 0.8)',
      radiusLg: 'var(--radius)',
      radiusXl: 'calc(var(--radius) * 1.2)',
      radius2xl: 'calc(var(--radius) * 1.6)',
    },
    
    // Component Styles - Enterprise
    components: {
      button: {
        variant: 'default',
        radius: 'rounded-lg',
        shadow: 'shadow-sm',
      },
      card: {
        variant: 'dark',
        radius: 'rounded-xl',
        shadow: 'shadow-sm',
        border: 'border border-white/5',
        background: 'bg-[#0a0e1a]',
      },
      input: {
        variant: 'dark',
        radius: 'rounded-lg',
        border: 'border border-white/10 focus:border-primary',
        background: 'bg-white/5',
      },
      badge: {
        variant: 'dark',
        radius: 'rounded-full',
      },
      sidebar: {
        variant: 'dark',
        width: '60',
        collapsedWidth: '16',
        background: 'bg-[#05080f]',
      },
    },
    
    // Animation - Fast
    animation: {
      duration: '150ms',
      easing: 'ease-in-out',
    },
  };