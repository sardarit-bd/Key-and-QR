export const WEBSITE_THEME = {
    id: 'website',
    name: 'Website Theme',
    isDark: false,
    
    // Color System
    colors: {
      // Backgrounds
      background: 'oklch(1 0 0)',
      backgroundSecondary: 'oklch(0.97 0 0)',
      backgroundTertiary: 'oklch(0.95 0 0)',
      
      // Foregrounds
      foreground: 'oklch(0.145 0 0)',
      foregroundSecondary: 'oklch(0.556 0 0)',
      foregroundTertiary: 'oklch(0.708 0 0)',
      
      // Primary
      primary: 'oklch(0.205 0 0)',
      primaryForeground: 'oklch(0.985 0 0)',
      
      // Secondary
      secondary: 'oklch(0.97 0 0)',
      secondaryForeground: 'oklch(0.205 0 0)',
      
      // Accent
      accent: 'oklch(0.97 0 0)',
      accentForeground: 'oklch(0.205 0 0)',
      
      // Muted
      muted: 'oklch(0.97 0 0)',
      mutedForeground: 'oklch(0.556 0 0)',
      
      // Destructive
      destructive: 'oklch(0.577 0.245 27.325)',
      destructiveForeground: 'oklch(0.985 0 0)',
      
      // Borders
      border: 'oklch(0.922 0 0)',
      input: 'oklch(0.922 0 0)',
      ring: 'oklch(0.708 0 0)',
      
      // Cards
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.145 0 0)',
      
      // Popover
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.145 0 0)',
      
      // Sidebar
      sidebar: 'oklch(0.985 0 0)',
      sidebarForeground: 'oklch(0.145 0 0)',
      sidebarPrimary: 'oklch(0.205 0 0)',
      sidebarPrimaryForeground: 'oklch(0.985 0 0)',
      sidebarAccent: 'oklch(0.97 0 0)',
      sidebarAccentForeground: 'oklch(0.205 0 0)',
      sidebarBorder: 'oklch(0.922 0 0)',
      sidebarRing: 'oklch(0.708 0 0)',
      
      // Charts
      chart1: 'oklch(0.87 0 0)',
      chart2: 'oklch(0.556 0 0)',
      chart3: 'oklch(0.439 0 0)',
      chart4: 'oklch(0.371 0 0)',
      chart5: 'oklch(0.269 0 0)',
    },
    
    // Typography
    typography: {
      fontFamily: 'var(--font-inter)',
      headingFont: 'var(--font-playfair)',
      monoFont: 'var(--font-geist-mono)',
      baseSize: '16px',
      scale: 1.25,
    },
    
    // Spacing
    spacing: {
      radius: '0.625rem',
      radiusSm: 'calc(var(--radius) * 0.6)',
      radiusMd: 'calc(var(--radius) * 0.8)',
      radiusLg: 'var(--radius)',
      radiusXl: 'calc(var(--radius) * 1.4)',
      radius2xl: 'calc(var(--radius) * 1.8)',
    },
    
    // Component Styles
    components: {
      button: {
        variant: 'default',
        radius: 'rounded-md',
        shadow: 'shadow-sm',
      },
      card: {
        variant: 'default',
        radius: 'rounded-xl',
        shadow: 'shadow-sm',
        border: 'border border-gray-200',
      },
      input: {
        variant: 'default',
        radius: 'rounded-md',
        border: 'border border-gray-300',
      },
      badge: {
        variant: 'default',
        radius: 'rounded-full',
      },
      sidebar: {
        variant: 'default',
        width: '64',
        collapsedWidth: '16',
      },
    },
    
    // Animation
    animation: {
      duration: '200ms',
      easing: 'ease-in-out',
    },
  };