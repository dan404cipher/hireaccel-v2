/**
 * Theme configuration for React Native Paper
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { COLORS } from '@/constants/config';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    tertiary: COLORS.primaryDark,
    error: COLORS.error,
    background: COLORS.background,
    surface: COLORS.surface,
    onSurface: COLORS.text,
    onBackground: COLORS.text,
    surfaceVariant: COLORS.surface,
    outline: COLORS.border,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    tertiary: COLORS.primaryDark,
    error: COLORS.error,
  },
};

