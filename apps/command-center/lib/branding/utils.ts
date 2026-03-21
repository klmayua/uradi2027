/**
 * Branding Utilities
 * Color manipulation and CSS generation for multi-tenant branding
 */

import { BrandingColors } from '@/types/branding';

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate luminance of a color
 * Used for determining contrast text color
 */
export function calculateLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Get contrast color (black or white) for a given background
 * Ensures WCAG contrast compliance
 */
export function getContrastColor(backgroundColor: string): string {
  const luminance = calculateLuminance(backgroundColor);
  return luminance > 0.5 ? '#111827' : '#FFFFFF';
}

/**
 * Lighten a color by a percentage
 */
export function lighten(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const amount = Math.floor((255 * percent) / 100);
  const r = Math.min(255, rgb.r + amount);
  const g = Math.min(255, rgb.g + amount);
  const b = Math.min(255, rgb.b + amount);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Darken a color by a percentage
 */
export function darken(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const amount = Math.floor((rgb.r * percent) / 100);
  const r = Math.max(0, rgb.r - amount);
  const g = Math.max(0, rgb.g - amount);
  const b = Math.max(0, rgb.b - amount);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Add alpha transparency to a color
 */
export function alpha(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Generate CSS custom properties from branding colors
 * These are applied to the :root or a container element
 */
export function generateCSSVariables(colors: BrandingColors): Record<string, string> {
  const primary = colors.primary;
  const secondary = colors.secondary;

  return {
    // Brand colors
    '--brand-primary': primary,
    '--brand-primary-light': lighten(primary, 20),
    '--brand-primary-dark': darken(primary, 20),
    '--brand-primary-muted': alpha(primary, 0.1),
    '--brand-secondary': secondary,
    '--brand-secondary-light': lighten(secondary, 20),
    '--brand-secondary-dark': darken(secondary, 20),
    '--brand-accent': colors.accent,

    // Semantic colors
    '--brand-text': colors.text,
    '--brand-text-muted': colors['text-muted'],
    '--brand-background': colors.background,
    '--brand-surface': colors.surface,
    '--brand-success': colors.success,
    '--brand-warning': colors.warning,
    '--brand-error': colors.error,

    // Generated contrast colors
    '--brand-primary-contrast': getContrastColor(primary),
    '--brand-secondary-contrast': getContrastColor(secondary),

    // Shadows
    '--shadow-primary': `0 4px 14px ${alpha(primary, 0.39)}`,
    '--shadow-primary-hover': `0 6px 20px ${alpha(primary, 0.4)}`,
  };
}

/**
 * Generate Google Fonts URL from font configuration
 */
export function generateGoogleFontsUrl(fonts: { display: string; body: string; mono?: string }): string {
  const fontFamilies = [fonts.display, fonts.body];
  if (fonts.mono) fontFamilies.push(fonts.mono);

  const query = fontFamilies
    .map((font) => font.replace(/\s+/g, '+'))
    .map((font) => `family=${font}:wght@400;500;600;700`)
    .join('&');

  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

/**
 * Validate branding configuration
 * Returns array of errors or empty if valid
 */
export function validateBranding(config: unknown): string[] {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    errors.push('Config must be an object');
    return errors;
  }

  const c = config as Record<string, unknown>;

  // Check required fields
  if (!c.candidate_name) errors.push('Candidate name is required');
  if (!c.campaign_slogan) errors.push('Campaign slogan is required');
  if (!c.location) errors.push('Location is required');

  // Check colors
  if (c.colors && typeof c.colors === 'object') {
    const requiredColors = ['primary', 'secondary', 'text', 'background'];
    const colors = c.colors as Record<string, string>;
    for (const color of requiredColors) {
      if (!colors[color]) errors.push(`Color '${color}' is required`);
      else if (!/^#[0-9A-Fa-f]{6}$/.test(colors[color])) {
        errors.push(`Color '${color}' must be a valid hex code`);
      }
    }
  } else {
    errors.push('Colors configuration is required');
  }

  return errors;
}

/**
 * Calculate color accessibility score (WCAG contrast ratio)
 * Returns ratio and compliance level
 */
export function calculateContrastRatio(color1: string, color2: string): { ratio: number; aa: boolean; aaa: boolean } {
  const lum1 = calculateLuminance(color1);
  const lum2 = calculateLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    aa: ratio >= 4.5,
    aaa: ratio >= 7,
  };
}

/**
 * Suggest accessible color adjustments
 * If a color doesn't meet WCAG AA, suggest lighter/darker alternatives
 */
export function suggestAccessibleColor(
  backgroundColor: string,
  targetRatio: number = 4.5
): { suggested: string; direction: 'lighter' | 'darker' } {
  const isDark = calculateLuminance(backgroundColor) > 0.5;
  const suggested = isDark ? '#111827' : '#FFFFFF';

  return {
    suggested,
    direction: isDark ? 'darker' : 'lighter',
  };
}
