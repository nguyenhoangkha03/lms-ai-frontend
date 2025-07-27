export const designSystemConfig = {
  version: '1.0.0',
  name: 'LMS AI Design System',
  description: 'A comprehensive design system for the LMS AI platform',

  components: {
    prefix: 'lms-',
    baseClasses: {
      focus:
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      transition: 'transition-colors duration-200',
      disabled: 'disabled:pointer-events-none disabled:opacity-50',
    },
  },

  themes: {
    light: {
      name: 'Light',
      description: 'Light theme for better visibility',
    },
    dark: {
      name: 'Dark',
      description: 'Dark theme for reduced eye strain',
    },
    system: {
      name: 'System',
      description: 'Follows system preference',
    },
  },

  accessibility: {
    focusVisible: true,
    reduceMotion: true,
    highContrast: false,
    screenReaderSupport: true,
  },

  performance: {
    lazyLoading: true,
    bundleSplitting: true,
    treeshaking: true,
  },
} as const;

export default designSystemConfig;
