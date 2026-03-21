/**
 * Uradi Monitor - White-Label Brand Configuration
 * Enables generation of branded candidate versions + public CSR version
 */

export interface BrandConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'public' | 'campaign';

  // Visual Identity
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    success: string;
    warning: string;
    error: string;
  };

  // Assets
  assets: {
    icon: string;
    adaptiveIcon: string;
    splash: string;
    logo: string;
    favicon: string;
  };

  // App Configuration
  app: {
    bundleId: string;
    scheme: string;
    version: string;
    buildNumber: string;
  };

  // Features
  features: {
    blockchainVerification: boolean;
    publicResults: boolean;
    incidentsPublic: boolean;
    customBranding: boolean;
    analytics: boolean;
  };

  // Metadata
  metadata: {
    author: string;
    website: string;
    privacyPolicy: string;
    termsOfService: string;
    supportEmail: string;
  };

  // Campaign-specific (for campaign type)
  campaign?: {
    candidateName: string;
    position: string;
    state: string;
    party?: string;
    slogan: string;
    authorizedStates: string[];
    restrictToStates: boolean;
  };
}

export const BRANDS: Record<string, BrandConfig> = {
  // Public CSR Version - Available to all citizens and civil society
  uradi360: {
    id: 'uradi360',
    name: 'Uradi Monitor',
    displayName: 'Uradi Monitor',
    description: 'Citizen-powered election monitoring. Verify. Report. Protect Democracy.',
    type: 'public',
    colors: {
      primary: '#D4AF37',     // Gold - Nigerian prosperity
      secondary: '#008751',   // Green - Nigerian flag
      accent: '#FFFFFF',
      background: '#000000',
      surface: '#111111',
      text: '#FFFFFF',
      success: '#00FF00',
      warning: '#FFA500',
      error: '#FF0000',
    },
    assets: {
      icon: './assets/uradi/icon.png',
      adaptiveIcon: './assets/uradi/adaptive-icon.png',
      splash: './assets/uradi/splash.png',
      logo: './assets/uradi/logo.png',
      favicon: './assets/uradi/favicon.png',
    },
    app: {
      bundleId: 'org.uradi360.monitor',
      scheme: 'uradi',
      version: '1.0.0',
      buildNumber: '1',
    },
    features: {
      blockchainVerification: true,
      publicResults: true,
      incidentsPublic: true,
      customBranding: false,
      analytics: true,
    },
    metadata: {
      author: 'Uradi360 Initiative',
      website: 'https://uradi360.org',
      privacyPolicy: 'https://uradi360.org/privacy',
      termsOfService: 'https://uradi360.org/terms',
      supportEmail: 'support@uradi360.org',
    },
  },

  // Template for Campaign Branded Versions
  // Each campaign gets their own build with these customized
  campaign_template: {
    id: 'template',
    name: 'Campaign Monitor',
    displayName: '{{CANDIDATE_NAME}} Monitor',
    description: 'Official election monitoring app for {{CANDIDATE_NAME}}\'s campaign',
    type: 'campaign',
    colors: {
      primary: '{{PRIMARY_COLOR}}',
      secondary: '{{SECONDARY_COLOR}}',
      accent: '#FFFFFF',
      background: '#000000',
      surface: '#111111',
      text: '#FFFFFF',
      success: '#00FF00',
      warning: '#FFA500',
      error: '#FF0000',
    },
    assets: {
      icon: './assets/branded/{{BRAND_ID}}/icon.png',
      adaptiveIcon: './assets/branded/{{BRAND_ID}}/adaptive-icon.png',
      splash: './assets/branded/{{BRAND_ID}}/splash.png',
      logo: './assets/branded/{{BRAND_ID}}/logo.png',
      favicon: './assets/branded/{{BRAND_ID}}/favicon.png',
    },
    app: {
      bundleId: 'org.{{BRAND_ID}}.monitor',
      scheme: '{{BRAND_ID}}',
      version: '1.0.0',
      buildNumber: '1',
    },
    features: {
      blockchainVerification: true,
      publicResults: false,  // Campaign versions only see their own data
      incidentsPublic: false,
      customBranding: true,
      analytics: true,
    },
    metadata: {
      author: '{{CANDIDATE_NAME}} Campaign',
      website: '{{CAMPAIGN_WEBSITE}}',
      privacyPolicy: '{{CAMPAIGN_WEBSITE}}/privacy',
      termsOfService: '{{CAMPAIGN_WEBSITE}}/terms',
      supportEmail: 'tech@{{BRAND_ID}}.campaign',
    },
    campaign: {
      candidateName: '{{CANDIDATE_NAME}}',
      position: '{{POSITION}}',
      state: '{{STATE}}',
      party: '{{PARTY}}',
      slogan: '{{SLOGAN}}',
      authorizedStates: ['{{STATE}}'],
      restrictToStates: true,
    },
  },

  // Example: Sample Campaign (Kano Governorship - fictional)
  // This demonstrates how a real campaign config would look
  demo_kano_2027: {
    id: 'demo_kano_2027',
    name: 'Alhaji Monitor',
    displayName: 'Alhaji Sanusi Monitor',
    description: 'Official election monitoring for Kano State Governorship 2027',
    type: 'campaign',
    colors: {
      primary: '#1B5E20',     // Deep Green
      secondary: '#FFC107',   // Amber
      accent: '#FFFFFF',
      background: '#000000',
      surface: '#0D1F0D',
      text: '#FFFFFF',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
    },
    assets: {
      icon: './assets/branded/demo_kano_2027/icon.png',
      adaptiveIcon: './assets/branded/demo_kano_2027/adaptive-icon.png',
      splash: './assets/branded/demo_kano_2027/splash.png',
      logo: './assets/branded/demo_kano_2027/logo.png',
      favicon: './assets/branded/demo_kano_2027/favicon.png',
    },
    app: {
      bundleId: 'org.sanusi2027.monitor',
      scheme: 'sanusi2027',
      version: '1.0.0',
      buildNumber: '1',
    },
    features: {
      blockchainVerification: true,
      publicResults: false,
      incidentsPublic: false,
      customBranding: true,
      analytics: true,
    },
    metadata: {
      author: 'Sanusi 2027 Campaign',
      website: 'https://sanusi2027.ng',
      privacyPolicy: 'https://sanusi2027.ng/privacy',
      termsOfService: 'https://sanusi2027.ng/terms',
      supportEmail: 'tech@sanusi2027.ng',
    },
    campaign: {
      candidateName: 'Alhaji Sanusi Lamido',
      position: 'Governor',
      state: 'Kano',
      party: 'NNPP',
      slogan: 'Kano First, Always',
      authorizedStates: ['Kano'],
      restrictToStates: true,
    },
  },
};

export const DEFAULT_BRAND = 'uradi360';

export const getActiveBrand = (): BrandConfig => {
  const brandId = process.env.EXPO_PUBLIC_BRAND_ID || DEFAULT_BRAND;
  return BRANDS[brandId] || BRANDS[DEFAULT_BRAND];
};

export const isCampaignMode = (): boolean => {
  return getActiveBrand().type === 'campaign';
};

export const isPublicMode = (): boolean => {
  return getActiveBrand().type === 'public';
};
