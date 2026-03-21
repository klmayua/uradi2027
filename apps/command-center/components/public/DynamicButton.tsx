'use client';

/**
 * Dynamic Button Component
 * Automatically adapts to tenant branding colors
 */

import React from 'react';
import { useBranding } from './BrandingProvider';
import { cn } from '@/lib/utils';

interface DynamicButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function DynamicButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  href,
  disabled = false,
  type = 'button',
}: DynamicButtonProps) {
  const { config, utils } = useBranding();
  const { primary, secondary } = config.colors;

  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-250 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${primary}, ${utils.darken(primary, 20)})`,
      color: utils.getContrastColor(primary),
      boxShadow: `0 4px 14px ${utils.alpha(primary, 0.39)}`,
    },
    secondary: {
      background: secondary,
      color: utils.getContrastColor(secondary),
    },
    outline: {
      background: 'transparent',
      color: primary,
      border: `2px solid ${primary}`,
    },
    ghost: {
      background: 'transparent',
      color: primary,
    },
  };

  const Component = href ? 'a' : 'button';

  return (
    <Component
      href={href}
      onClick={onClick}
      disabled={disabled}
      type={href ? undefined : type}
      className={cn(baseStyles, sizeStyles[size], className)}
      style={variantStyles[variant]}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 6px 20px ${utils.alpha(primary, 0.4)}`;
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = variantStyles.primary.boxShadow;
        }
      }}
    >
      {children}
    </Component>
  );
}
