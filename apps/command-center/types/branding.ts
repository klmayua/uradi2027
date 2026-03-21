/**
 * Branding Configuration Types
 * Multi-tenant public website branding system
 */

export interface BrandingColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  'text-muted': string;
  background: string;
  surface: string;
  success: string;
  warning: string;
  error: string;
}

export interface BrandingFonts {
  display: string;
  body: string;
  mono?: string;
}

export interface BrandingAssets {
  logo: string;
  logo_white?: string;
  favicon: string;
  hero_image?: string;
  og_image?: string;
  candidate_portrait?: string;
}

export interface NavItem {
  name: string;
  href: string;
  show: boolean;
}

export interface PolicyArea {
  icon: string;
  title: string;
  description: string;
  stat: string;
  progress: number;
}

export interface CampaignStat {
  label: string;
  value: number;
  suffix: string;
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'whatsapp';
  url: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

export interface PublicLayoutConfig {
  hero_style: 'split' | 'centered' | 'minimal' | 'video';
  show_scorecard: boolean;
  show_donate: boolean;
  show_volunteer: boolean;
  show_news: boolean;
  show_events: boolean;
  nav_items: NavItem[];
}

export interface BrandingConfig {
  // Identity
  candidate_name: string;
  candidate_title?: string;
  campaign_slogan: string;
  location: string;
  party?: string;

  // Visual
  colors: BrandingColors;
  fonts: BrandingFonts;
  assets: BrandingAssets;

  // Layout
  layout: PublicLayoutConfig;

  // Content
  content: {
    policies: PolicyArea[];
    stats: CampaignStat[];
    social_links: SocialLink[];
    contact: ContactInfo;
  };

  // Advanced
  custom_css?: string;
  custom_js?: string;
  meta_description?: string;
  meta_keywords?: string;
}

// Theme presets for quick setup
export const THEME_PRESETS: Record<string, Partial<BrandingConfig>> = {
  classic_authority: {
    colors: {
      primary: '#D4AF37',
      secondary: '#0A1628',
      accent: '#1E3A5F',
      text: '#111827',
      'text-muted': '#6B7280',
      background: '#FFFFFF',
      surface: '#FAFAF9',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
    },
    fonts: {
      display: 'Cormorant Garamond',
      body: 'Inter',
      mono: 'JetBrains Mono',
    },
  },
  progressive_energy: {
    colors: {
      primary: '#059669',
      secondary: '#064E3B',
      accent: '#34D399',
      text: '#111827',
      'text-muted': '#6B7280',
      background: '#FFFFFF',
      surface: '#F0FDF4',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
    },
    fonts: {
      display: 'Montserrat',
      body: 'Open Sans',
      mono: 'JetBrains Mono',
    },
  },
  unity_trust: {
    colors: {
      primary: '#2563EB',
      secondary: '#1E40AF',
      accent: '#60A5FA',
      text: '#111827',
      'text-muted': '#6B7280',
      background: '#FFFFFF',
      surface: '#EFF6FF',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
    },
    fonts: {
      display: 'Playfair Display',
      body: 'Lato',
      mono: 'JetBrains Mono',
    },
  },
  heritage_culture: {
    colors: {
      primary: '#5B21B6',
      secondary: '#4C1D95',
      accent: '#A78BFA',
      text: '#111827',
      'text-muted': '#6B7280',
      background: '#FFFFFF',
      surface: '#F5F3FF',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
    },
    fonts: {
      display: 'Merriweather',
      body: 'Source Sans Pro',
      mono: 'JetBrains Mono',
    },
  },
  future_forward: {
    colors: {
      primary: '#7C3AED',
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
    fonts: {
      display: 'Space Grotesk',
      body: 'Inter',
      mono: 'JetBrains Mono',
    },
  },
};

// Default branding (fallback)
export const DEFAULT_BRANDING: BrandingConfig = {
  candidate_name: 'Candidate Name',
  candidate_title: 'For Office',
  campaign_slogan: 'Leadership That Delivers',
  location: 'Your State',
  colors: THEME_PRESETS.classic_authority.colors as BrandingColors,
  fonts: THEME_PRESETS.classic_authority.fonts as BrandingFonts,
  assets: {
    logo: '/images/default-logo.svg',
    favicon: '/favicon.ico',
  },
  layout: {
    hero_style: 'split',
    show_scorecard: true,
    show_donate: true,
    show_volunteer: true,
    show_news: true,
    show_events: true,
    nav_items: [
      { name: 'Home', href: '/', show: true },
      { name: 'About', href: '/about', show: true },
      { name: 'Vision', href: '/vision', show: true },
      { name: 'Scorecard', href: '/scorecard', show: true },
      { name: 'News', href: '/news', show: true },
      { name: 'Get Involved', href: '/get-involved', show: true },
      { name: 'Donate', href: '/donate', show: true },
    ],
  },
  content: {
    policies: [],
    stats: [
      { label: 'Supporters', value: 0, suffix: '+' },
      { label: 'Days to Election', value: 0, suffix: '' },
      { label: 'LGAs Covered', value: 0, suffix: '' },
      { label: 'Projects', value: 0, suffix: '' },
    ],
    social_links: [],
    contact: {
      email: 'contact@campaign.com',
      phone: '+234-000-000-0000',
      address: 'Campaign Headquarters',
    },
  },
};
