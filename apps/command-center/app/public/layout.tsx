import type { Metadata } from 'next';
import { BrandingProvider } from '@/components/public/BrandingProvider';
import { DEFAULT_BRANDING, THEME_PRESETS } from '@/types/branding';
import { generateGoogleFontsUrl } from '@/lib/branding/utils';
import './globals.css';

// In production, this would fetch from an API
async function fetchTenantBranding(tenantSlug: string) {
  // Mock tenant data - replace with actual API call
  const tenantConfigs: Record<string, typeof DEFAULT_BRANDING> = {
    jigawa: {
      ...DEFAULT_BRANDING,
      candidate_name: 'Mustapha Lamido',
      candidate_title: 'For Governor',
      campaign_slogan: 'Leadership That Delivers for Jigawa',
      location: 'Jigawa',
      party: 'PDP',
      colors: {
        primary: '#DC2626', // Red for PDP
        secondary: '#0A1628',
        accent: '#EF4444',
        text: '#111827',
        'text-muted': '#6B7280',
        background: '#FFFFFF',
        surface: '#FAFAF9',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
      },
      fonts: THEME_PRESETS.classic_authority.fonts as typeof DEFAULT_BRANDING.fonts,
      assets: {
        logo: '/images/lamido-logo.svg',
        favicon: '/favicon.ico',
      },
      layout: {
        ...DEFAULT_BRANDING.layout,
        hero_style: 'split',
      },
      content: {
        ...DEFAULT_BRANDING.content,
        stats: [
          { label: 'Supporters', value: 50000, suffix: '+' },
          { label: 'Days to Election', value: 247, suffix: '' },
          { label: 'LGAs Covered', value: 27, suffix: '' },
          { label: 'Projects', value: 156, suffix: '' },
        ],
      },
    },
    kano: {
      ...DEFAULT_BRANDING,
      candidate_name: 'Ibrahim Khalil',
      candidate_title: 'For Governor',
      campaign_slogan: 'A New Vision for Kano',
      location: 'Kano',
      party: 'NNPP',
      colors: {
        primary: '#7C3AED', // Purple
        secondary: '#000000',
        accent: '#A78BFA',
        text: '#111827',
        'text-muted': '#6B7280',
        background: '#FFFFFF',
        surface: '#FAFAFA',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
      },
      fonts: THEME_PRESETS.future_forward.fonts as typeof DEFAULT_BRANDING.fonts,
      assets: {
        logo: '/images/khalil-logo.svg',
        favicon: '/favicon.ico',
      },
      layout: {
        ...DEFAULT_BRANDING.layout,
        hero_style: 'centered',
      },
      content: {
        ...DEFAULT_BRANDING.content,
        stats: [
          { label: 'Supporters', value: 75000, suffix: '+' },
          { label: 'Days to Election', value: 247, suffix: '' },
          { label: 'LGAs Covered', value: 44, suffix: '' },
          { label: 'Projects', value: 200, suffix: '' },
        ],
      },
    },
  };

  return tenantConfigs[tenantSlug] || DEFAULT_BRANDING;
}

interface PublicLayoutProps {
  children: React.ReactNode;
  params?: { tenant?: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params, searchParams }: PublicLayoutProps): Promise<Metadata> {
  // Get tenant from search params or default
  const tenantParam = searchParams?.tenant;
  const tenant = typeof tenantParam === 'string' ? tenantParam : (params?.tenant || 'default');
  const branding = await fetchTenantBranding(tenant);

  return {
    title: `${branding.candidate_name} | ${branding.campaign_slogan}`,
    description: `Join the movement for progress in ${branding.location}. ${branding.campaign_slogan}`,
    openGraph: {
      title: `${branding.candidate_name} | ${branding.campaign_slogan}`,
      description: `Join the movement for progress in ${branding.location}`,
      type: 'website',
      images: branding.assets.og_image ? [{ url: branding.assets.og_image }] : undefined,
    },
  };
}

export default async function PublicLayout({ children, params, searchParams }: PublicLayoutProps) {
  // Get tenant from search params or default
  const tenantParam = searchParams?.tenant;
  const tenant = typeof tenantParam === 'string' ? tenantParam : (params?.tenant || 'default');
  const branding = await fetchTenantBranding(tenant);
  const fontsUrl = generateGoogleFontsUrl(branding.fonts);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontsUrl} rel="stylesheet" />
        {branding.custom_css && (
          <style dangerouslySetInnerHTML={{ __html: branding.custom_css }} />
        )}
      </head>
      <body
        className="font-sans antialiased"
        style={{
          fontFamily: branding.fonts.body,
          backgroundColor: branding.colors.background,
          color: branding.colors.text,
        }}
      >
        <BrandingProvider config={branding}>{children}</BrandingProvider>
      </body>
    </html>
  );
}
