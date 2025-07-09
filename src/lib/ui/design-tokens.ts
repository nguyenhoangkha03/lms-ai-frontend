export const DESIGN_CONSTANTS = {
  HEADER_HEIGHT: '4rem',
  SIDEBAR_WIDTH: '16rem',
  SIDEBAR_COLLAPSED_WIDTH: '4rem',
  FOOTER_HEIGHT: 'auto',

  CONTAINER_PADDING: {
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem',
  },

  BUTTON_HEIGHT: {
    sm: '2.25rem',
    md: '2.5rem',
    lg: '2.75rem',
    xl: '3rem',
  },

  INPUT_HEIGHT: {
    sm: '2.25rem',
    md: '2.5rem',
    lg: '2.75rem',
    xl: '3rem',
  },

  BORDER_RADIUS: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },

  ANIMATION_DURATION: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  Z_INDEX: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  },
} as const;
