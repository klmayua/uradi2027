/**
 * Dynamic Brand Theme System
 * Automatically adapts UI to active brand configuration
 */

import { getActiveBrand, isCampaignMode, BrandConfig } from '@branding/brands.config';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textMuted: string;
  textInverse: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeTypography {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };
  sizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    sm: object;
    md: object;
    lg: object;
  };
  brand: BrandConfig;
  isCampaign: boolean;
  isPublic: boolean;
}

const generateThemeFromBrand = (brand: BrandConfig): Theme => {
  const darken = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  const lighten = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min((num >> 16) + amt, 255);
    const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
    const B = Math.min((num & 0x0000FF) + amt, 255);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

  return {
    colors: {
      primary: brand.colors.primary,
      primaryDark: darken(brand.colors.primary, 20),
      primaryLight: lighten(brand.colors.primary, 20),
      secondary: brand.colors.secondary,
      accent: brand.colors.accent,
      background: brand.colors.background,
      surface: brand.colors.surface,
      surfaceElevated: lighten(brand.colors.surface, 10),
      text: brand.colors.text,
      textMuted: '#999999',
      textInverse: '#000000',
      border: '#222222',
      success: brand.colors.success || '#00FF00',
      warning: brand.colors.warning || '#FFA500',
      error: brand.colors.error || '#FF0000',
      info: '#3498db',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    typography: {
      fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
      },
      sizes: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18,
        xxl: 24,
        xxxl: 32,
      },
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 999,
    },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
    },
    brand,
    isCampaign: brand.type === 'campaign',
    isPublic: brand.type === 'public',
  };
};

// Export singleton theme instance
export const getTheme = (): Theme => {
  const brand = getActiveBrand();
  return generateThemeFromBrand(brand);
};

// Style helper for dynamic brand colors
export const brandStyles = {
  primaryButton: (theme: Theme) => ({
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
  }),
  primaryButtonText: (theme: Theme) => ({
    color: theme.colors.textInverse,
    fontWeight: '600' as const,
  }),
  card: (theme: Theme) => ({
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  }),
  screen: (theme: Theme) => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  }),
  header: (theme: Theme) => ({
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  }),
  input: (theme: Theme) => ({
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  }),
};

// Hook-compatible theme access
export const useBrandTheme = (): Theme => {
  return getTheme();
};
