export const designTokens = {
  colors: {
    primary: {
      50: 'hsl(221, 83%, 97%)',
      100: 'hsl(221, 83%, 94%)',
      200: 'hsl(221, 83%, 88%)',
      300: 'hsl(221, 83%, 78%)',
      400: 'hsl(221, 83%, 68%)',
      500: 'hsl(221, 83%, 53%)', // Default primary
      600: 'hsl(221, 83%, 43%)',
      700: 'hsl(221, 83%, 33%)',
      800: 'hsl(221, 83%, 23%)',
      900: 'hsl(221, 83%, 13%)',
      950: 'hsl(221, 83%, 8%)',
    },

    ai: {
      primary: 'hsl(258, 89%, 66%)',
      secondary: 'hsl(280, 100%, 70%)',
      accent: 'hsl(267, 84%, 81%)',
      background: 'hsl(258, 89%, 96%)',
      border: 'hsl(258, 40%, 85%)',
    },

    semantic: {
      success: {
        50: 'hsl(142, 76%, 96%)',
        100: 'hsl(142, 76%, 91%)',
        500: 'hsl(142, 76%, 36%)',
        600: 'hsl(142, 76%, 31%)',
        900: 'hsl(142, 76%, 16%)',
      },
      warning: {
        50: 'hsl(45, 93%, 97%)',
        100: 'hsl(45, 93%, 94%)',
        500: 'hsl(45, 93%, 47%)',
        600: 'hsl(45, 93%, 42%)',
        900: 'hsl(45, 93%, 22%)',
      },
      danger: {
        50: 'hsl(0, 84%, 97%)',
        100: 'hsl(0, 84%, 94%)',
        500: 'hsl(0, 84%, 60%)',
        600: 'hsl(0, 84%, 55%)',
        900: 'hsl(0, 84%, 30%)',
      },
      info: {
        50: 'hsl(204, 94%, 97%)',
        100: 'hsl(204, 94%, 94%)',
        500: 'hsl(204, 94%, 44%)',
        600: 'hsl(204, 94%, 39%)',
        900: 'hsl(204, 94%, 19%)',
      },
    },

    progress: {
      easy: 'hsl(142, 76%, 36%)', // Green
      medium: 'hsl(45, 93%, 47%)', // Yellow
      hard: 'hsl(346, 87%, 43%)', // Red
      completed: 'hsl(258, 89%, 66%)', // Purple
    },

    neutral: {
      0: 'hsl(0, 0%, 100%)',
      50: 'hsl(210, 40%, 98%)',
      100: 'hsl(210, 40%, 96%)',
      200: 'hsl(214, 32%, 91%)',
      300: 'hsl(213, 27%, 84%)',
      400: 'hsl(215, 20%, 65%)',
      500: 'hsl(215, 16%, 47%)',
      600: 'hsl(215, 19%, 35%)',
      700: 'hsl(215, 25%, 27%)',
      800: 'hsl(217, 33%, 17%)',
      900: 'hsl(222, 84%, 5%)',
      950: 'hsl(222, 84%, 3%)',
    },
  },

  typography: {
    fontFamily: {
      sans: 'var(--font-inter)',
      heading: 'var(--font-cal-sans)',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },

  spacing: {
    0: '0px',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    32: '8rem', // 128px
    40: '10rem', // 160px
    48: '12rem', // 192px
    56: '14rem', // 224px
    64: '16rem', // 256px
  },

  layout: {
    headerHeight: '4rem',
    sidebarWidth: '16rem',
    sidebarCollapsedWidth: '4rem',
    maxContentWidth: '1200px',
    containerPadding: '1rem',
  },

  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
  },

  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },

  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  transition: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  componentSizes: {
    button: {
      sm: {
        height: '2rem',
        padding: '0 0.75rem',
        fontSize: '0.875rem',
      },
      base: {
        height: '2.5rem',
        padding: '0 1rem',
        fontSize: '0.875rem',
      },
      lg: {
        height: '2.75rem',
        padding: '0 2rem',
        fontSize: '1rem',
      },
      xl: {
        height: '3rem',
        padding: '0 2.5rem',
        fontSize: '1.125rem',
      },
    },
    input: {
      sm: {
        height: '2rem',
        padding: '0 0.75rem',
        fontSize: '0.875rem',
      },
      base: {
        height: '2.5rem',
        padding: '0 1rem',
        fontSize: '0.875rem',
      },
      lg: {
        height: '2.75rem',
        padding: '0 1rem',
        fontSize: '1rem',
      },
    },
  },
} as const;

export const themeConfig = {
  light: {
    colors: {
      background: designTokens.colors.neutral[0],
      foreground: designTokens.colors.neutral[900],
      card: designTokens.colors.neutral[0],
      cardForeground: designTokens.colors.neutral[900],
      popover: designTokens.colors.neutral[0],
      popoverForeground: designTokens.colors.neutral[900],
      primary: designTokens.colors.primary[500],
      primaryForeground: designTokens.colors.neutral[0],
      secondary: designTokens.colors.neutral[100],
      secondaryForeground: designTokens.colors.neutral[900],
      muted: designTokens.colors.neutral[100],
      mutedForeground: designTokens.colors.neutral[500],
      accent: designTokens.colors.neutral[100],
      accentForeground: designTokens.colors.neutral[900],
      destructive: designTokens.colors.semantic.danger[500],
      destructiveForeground: designTokens.colors.neutral[0],
      border: designTokens.colors.neutral[200],
      input: designTokens.colors.neutral[200],
      ring: designTokens.colors.primary[500],
    },
  },
  dark: {
    colors: {
      background: designTokens.colors.neutral[950],
      foreground: designTokens.colors.neutral[50],
      card: designTokens.colors.neutral[950],
      cardForeground: designTokens.colors.neutral[50],
      popover: designTokens.colors.neutral[950],
      popoverForeground: designTokens.colors.neutral[50],
      primary: designTokens.colors.primary[400],
      primaryForeground: designTokens.colors.neutral[900],
      secondary: designTokens.colors.neutral[800],
      secondaryForeground: designTokens.colors.neutral[50],
      muted: designTokens.colors.neutral[800],
      mutedForeground: designTokens.colors.neutral[400],
      accent: designTokens.colors.neutral[800],
      accentForeground: designTokens.colors.neutral[50],
      destructive: designTokens.colors.semantic.danger[500],
      destructiveForeground: designTokens.colors.neutral[50],
      border: designTokens.colors.neutral[800],
      input: designTokens.colors.neutral[800],
      ring: designTokens.colors.primary[400],
    },
  },
};

export type DesignTokens = typeof designTokens;
export type ThemeConfig = typeof themeConfig;
export type ColorTokens = keyof typeof designTokens.colors;
export type SpacingTokens = keyof typeof designTokens.spacing;
