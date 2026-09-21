import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { Appearance, useColorScheme, ColorSchemeName } from 'react-native';
import { useSettingsStore, ThemeMode } from '../store/useSettingsStore';
import { darkColors, lightColors, ColorTheme } from '../theme/colors';

export interface ThemeContextType {
  colors: ColorTheme;
  isDark: boolean;
  themeMode: ThemeMode;
  systemColorScheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: darkColors,
  isDark: true,
  themeMode: 'dark',
  systemColorScheme: 'dark',
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hookScheme = useColorScheme();
  const [nativeScheme, setNativeScheme] = useState<'light' | 'dark'>(() =>
    Appearance.getColorScheme() === 'light' ? 'light' : 'dark'
  );
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);

  // Escuta dinamicamente alterações de tema do SO
  useEffect(() => {
    if (Appearance.setColorScheme) {
      try {
        Appearance.setColorScheme(null as any);
      } catch (e) {}
    }

    const current = Appearance.getColorScheme();
    setNativeScheme(current === 'light' ? 'light' : 'dark');

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setNativeScheme(colorScheme === 'light' ? 'light' : 'dark');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const systemColorScheme: 'light' | 'dark' =
    hookScheme === 'light' || nativeScheme === 'light' || Appearance.getColorScheme() === 'light'
      ? 'light'
      : 'dark';

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ colors, isDark, themeMode, systemColorScheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => useContext(ThemeContext);
