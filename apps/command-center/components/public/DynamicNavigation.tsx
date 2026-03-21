'use client';

/**
 * Dynamic Navigation
 * Multi-tenant navigation with branding integration
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useBranding, useCandidateInfo } from './BrandingProvider';
import { DynamicButton } from './DynamicButton';
import { cn } from '@/lib/utils';

interface DynamicNavigationProps {
  transparent?: boolean;
}

export function DynamicNavigation({ transparent = true }: DynamicNavigationProps) {
  const { config, utils } = useBranding();
  const candidate = useCandidateInfo();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { layout, colors, assets } = config;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const visibleNavItems = layout.nav_items.filter((item) => item.show);

  const navBackground =
    isScrolled || !transparent
      ? colors.background
      : 'transparent';

  const navTextColor =
    isScrolled || !transparent
      ? colors.text
      : '#FFFFFF';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled && 'shadow-md'
      )}
      style={{ backgroundColor: navBackground }}
    >
      <div className="container-premium">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {assets.logo && (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                <Image
                  src={assets.logo}
                  alt={candidate.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="hidden sm:block">
              <span
                className="font-display font-bold text-xl"
                style={{ color: navTextColor }}
              >
                {candidate.name.split(' ').pop()}
              </span>
              <p
                className="text-xs opacity-80"
                style={{ color: navTextColor }}
              >
                For {candidate.location}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {visibleNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: navTextColor }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {layout.show_donate && (
              <DynamicButton variant="primary" size="sm" href="/donate">
                Donate
              </DynamicButton>
            )}
            {layout.show_volunteer && (
              <Link
                href="/get-involved"
                className="text-sm font-medium hover:opacity-80"
                style={{ color: navTextColor }}
              >
                Volunteer
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2"
            style={{ color: navTextColor }}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className="lg:hidden absolute top-full left-0 right-0 shadow-xl border-t"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.surface,
            }}
          >
            <nav className="container-premium py-6 flex flex-col gap-4">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-medium py-2 transition-colors"
                  style={{ color: colors.text }}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t mt-4">
                {layout.show_donate && (
                  <DynamicButton variant="primary" href="/donate">
                    Donate Now
                  </DynamicButton>
                )}
                {layout.show_volunteer && (
                  <Link
                    href="/get-involved"
                    className="text-center py-2"
                    style={{ color: colors.primary }}
                  >
                    Volunteer
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
