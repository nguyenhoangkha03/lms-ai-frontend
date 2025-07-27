export const responsiveUtilities = {
  container: {
    'container-xs': 'max-w-xs mx-auto',
    'container-sm': 'max-w-sm mx-auto',
    'container-md': 'max-w-md mx-auto',
    'container-lg': 'max-w-lg mx-auto',
    'container-xl': 'max-w-xl mx-auto',
    'container-2xl': 'max-w-2xl mx-auto',
    'container-3xl': 'max-w-3xl mx-auto',
    'container-4xl': 'max-w-4xl mx-auto',
    'container-5xl': 'max-w-5xl mx-auto',
    'container-6xl': 'max-w-6xl mx-auto',
    'container-7xl': 'max-w-7xl mx-auto',
    'container-full': 'max-w-full mx-auto',
  },

  spacing: {
    'responsive-p': 'p-4 md:p-6 lg:p-8',
    'responsive-px': 'px-4 md:px-6 lg:px-8',
    'responsive-py': 'py-4 md:py-6 lg:py-8',
    'responsive-m': 'm-4 md:m-6 lg:m-8',
    'responsive-mx': 'mx-4 md:mx-6 lg:mx-8',
    'responsive-my': 'my-4 md:my-6 lg:my-8',
  },

  typography: {
    'text-responsive-xs': 'text-xs sm:text-sm',
    'text-responsive-sm': 'text-sm sm:text-base',
    'text-responsive-base': 'text-base sm:text-lg',
    'text-responsive-lg': 'text-lg sm:text-xl',
    'text-responsive-xl': 'text-xl sm:text-2xl',
    'text-responsive-2xl': 'text-2xl sm:text-3xl',
    'text-responsive-3xl': 'text-3xl sm:text-4xl',
    'text-responsive-4xl': 'text-4xl sm:text-5xl',
  },

  grid: {
    'grid-responsive-1': 'grid-cols-1',
    'grid-responsive-2': 'grid-cols-1 sm:grid-cols-2',
    'grid-responsive-3': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    'grid-responsive-4':
      'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    'grid-responsive-6':
      'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
    'grid-responsive-12':
      'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12',
  },

  flex: {
    'flex-responsive-col': 'flex-col md:flex-row',
    'flex-responsive-row': 'flex-row md:flex-col',
    'flex-responsive-wrap': 'flex-wrap md:flex-nowrap',
    'flex-responsive-nowrap': 'flex-nowrap md:flex-wrap',
  },

  visibility: {
    'hidden-mobile': 'hidden sm:block',
    'hidden-tablet': 'block sm:hidden md:block',
    'hidden-desktop': 'block lg:hidden',
    'mobile-only': 'block sm:hidden',
    'tablet-only': 'hidden sm:block md:hidden',
    'desktop-only': 'hidden lg:block',
  },
};

export const { container, spacing, typography, grid, flex, visibility } =
  responsiveUtilities;
