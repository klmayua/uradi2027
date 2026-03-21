'use client';

/**
 * Branding Provider
 * React context for multi-tenant branding configuration
 */

import React, { createContext, useContext, useMemo } from 'react';
import { BrandingConfig } from '@/types/branding';
import { generateCSSVariables, getContrastColor, lighten, darken, alpha } from '@/lib/branding/utils';

interface BrandingContextValue {
  config: BrandingConfig;
  cssVariables: Record<string, string>;
  utils: {
    getContrastColor: (color: string) => string;
    lighten: (color: string, percent: number) => string;
    darken: (color: string, percent: number) => string;
    alpha: (color: string, opacity: number) => string;
  };
}

const BrandingContext = createContext<BrandingContextValue | null>(null);

interface BrandingProviderProps {
  children: React.ReactNode;
  config: BrandingConfig;
}

export function BrandingProvider({ children, config }: BrandingProviderProps) {
  const cssVariables = useMemo(() => generateCSSVariables(config.colors), [config.colors]);

  const value = useMemo(
    () => ({
      config,
      cssVariables,
      utils: {
        getContrastColor,
        lighten,
        darken,
        alpha,
      },
    }),
    [config, cssVariables]
  );

  return (
    <BrandingContext.Provider value={value}>
      <div style={cssVariables as React.CSSProperties}>{children}</div>
    </BrandingContext.Provider>
  );
}

/**
 * Hook to access branding configuration
 * Must be used within a BrandingProvider
 */
export function useBranding(): BrandingContextValue {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}

/**
 * Hook to access only the colors
 * Convenience hook for components that only need colors
 */
export function useBrandingColors() {
  const { config } = useBranding();
  return config.colors;
}

/**
 * Hook to access only the fonts
 */
export function useBrandingFonts() {
  const { config } = useBranding();
  return config.fonts;
}

/**
 * Hook to access only the layout config
 */
export function useBrandingLayout() {
  const { config } = useBranding();
  return config.layout;
}

/**
 * Hook to access only the content
 */
export function useBrandingContent() {
  const { config } = useBranding();
  return config.content;
}

/**
 * Hook to access candidate info
 */
export function useCandidateInfo() {
  const { config } = useBranding();
  return {
    name: config.candidate_name,
    title: config.candidate_title,
    slogan: config.campaign_slogan,
    location: config.location,
    party: config.party,
  };
}
