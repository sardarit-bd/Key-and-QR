export const USER_DASHBOARD_THEME = {
    id: 'user-dashboard',
    name: 'User Dashboard Theme',
    isDark: false,
    
    // Premium, Clean, Inspirational Color System
    colors: {
      // Backgrounds - Premium light
      background: 'oklch(0.98 0.005 280)',
      backgroundSecondary: 'oklch(0.96 0.008 280)',
      backgroundTertiary: 'oklch(0.94 0.01 280)',
      
      // Foregrounds - Elegant dark
      foreground: 'oklch(0.12 0.01 280)',
      foregroundSecondary: 'oklch(0.45 0.02 280)',
      foregroundTertiary: 'oklch(0.65 0.02 280)',
      
      // Primary - Premium Purple/Pink gradient
      primary: 'oklch(0.55 0.25 300)',
      primaryForeground: 'oklch(0.98 0 0)',
      primaryGradient: 'linear-gradient(135deg, oklch(0.55 0.25 300), oklch(0.45 0.3 340))',
      
      // Secondary - Soft lavender
      secondary: 'oklch(0.92 0.08 280)',
      secondaryForeground: 'oklch(0.35 0.2 300)',
      
      // Accent - Warm gold
      accent: 'oklch(0.92 0.12 85)',
      accentForeground: 'oklch(0.35 0.15 85)',
      
      // Muted - Subtle gray
      muted: 'oklch(0.95 0.005 280)',
      mutedForeground: 'oklch(0.55 0.02 280)',
      
      // Destructive
      destructive: 'oklch(0.577 0.245 27.325)',
      destructiveForeground: 'oklch(0.985 0 0)',
      
      // Borders - Soft
      border: 'oklch(0.92 0.01 280)',
      input: 'oklch(0.92 0.01 280)',
      ring: 'oklch(0.55 0.25 300)',
      
      // Cards - Glassmorphism ready
      card: 'oklch(1 0 0 / 0.8)',
      cardForeground: 'oklch(0.12 0.01 280)',
      
      // Popover
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.12 0.01 280)',
      
      // Sidebar - Premium glass
      sidebar: 'oklch(1 0 0 / 0.6)',
      sidebarForeground: 'oklch(0.12 0.01 280)',
      sidebarPrimary: 'oklch(0.55 0.25 300)',
      sidebarPrimaryForeground: 'oklch(0.98 0 0)',
      sidebarAccent: 'oklch(0.95 0.08 280)',
      sidebarAccentForeground: 'oklch(0.35 0.2 300)',
      sidebarBorder: 'oklch(0.92 0.01 280)',
      sidebarRing: 'oklch(0.55 0.25 300)',
      
      // Charts - Inspiring colors
      chart1: 'oklch(0.55 0.25 300)',
      chart2: 'oklch(0.45 0.3 340)',
      chart3: 'oklch(0.6 0.2 250)',
      chart4: 'oklch(0.5 0.2 200)',
      chart5: 'oklch(0.7 0.2 150)',
    },
    
    // Typography - Premium fonts
    typography: {
      fontFamily: 'var(--font-inter)',
      headingFont: 'var(--font-playfair)',
      monoFont: 'var(--font-geist-mono)',
      baseSize: '16px',
      scale: 1.25,
    },
    
    // Spacing - Generous
    spacing: {
      radius: '0.75rem',
      radiusSm: 'calc(var(--radius) * 0.6)',
      radiusMd: 'calc(var(--radius) * 0.8)',
      radiusLg: 'var(--radius)',
      radiusXl: 'calc(var(--radius) * 1.6)',
      radius2xl: 'calc(var(--radius) * 2.2)',
      radius3xl: 'calc(var(--radius) * 2.8)',
    },
    
    // Component Styles - Premium
    components: {
      button: {
        variant: 'gradient',
        radius: 'rounded-full',
        shadow: 'shadow-md hover:shadow-lg',
      },
      card: {
        variant: 'glass',
        radius: 'rounded-2xl',
        shadow: 'shadow-lg hover:shadow-xl',
        border: 'border border-white/20',
        background: 'backdrop-blur-sm bg-white/80',
      },
      input: {
        variant: 'premium',
        radius: 'rounded-xl',
        border: 'border border-gray-200/80 focus:border-primary',
        background: 'bg-white/60 backdrop-blur-sm',
      },
      badge: {
        variant: 'premium',
        radius: 'rounded-full',
      },
      sidebar: {
        variant: 'glass',
        width: '72',
        collapsedWidth: '20',
        background: 'backdrop-blur-md bg-white/70',
      },
    },
    
    // Animation - Smooth
    animation: {
      duration: '300ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  };