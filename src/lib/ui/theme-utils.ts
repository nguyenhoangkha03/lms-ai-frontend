export const getThemeColors = (theme: 'light' | 'dark') => {
  const colors = {
    light: {
      background: 'rgb(255, 255, 255)',
      foreground: 'rgb(15, 23, 42)',
      card: 'rgb(255, 255, 255)',
      primary: 'rgb(59, 130, 246)',
      secondary: 'rgb(100, 116, 139)',
      muted: 'rgb(241, 245, 249)',
      border: 'rgb(226, 232, 240)',
    },
    dark: {
      background: 'rgb(2, 6, 23)',
      foreground: 'rgb(248, 250, 252)',
      card: 'rgb(2, 6, 23)',
      primary: 'rgb(59, 130, 246)',
      secondary: 'rgb(100, 116, 139)',
      muted: 'rgb(15, 23, 42)',
      border: 'rgb(30, 41, 59)',
    },
  };

  return colors[theme];
};

export const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement;
  const colors = getThemeColors(theme);

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
};
