# Uradi Monitor - White-Label Build System

A comprehensive white-label system enabling the creation of both public CSR and branded campaign versions of the Uradi Monitor election monitoring app.

## Overview

The Uradi Monitor app supports two modes:

1. **Public CSR Version** (`uradi360`) - Available to all citizens and civil society organizations
2. **Campaign Branded Versions** - Custom-branded apps for specific governorship candidates

## Brand Configuration

### Existing Brands

| Brand ID | Type | Description | Status |
|----------|------|-------------|--------|
| `uradi360` | Public | Citizen-powered election monitoring | ✅ Active |
| `demo_kano_2027` | Campaign | Example Kano governorship campaign | 📋 Template |

### Creating a New Campaign Brand

```bash
# Interactive campaign onboarding
npx ts-node scripts/create-campaign.ts

# Or with arguments
npx ts-node scripts/create-campaign.ts \
  --name="Alhaji Sanusi" \
  --state=Kano \
  --party=NNPP \
  --position=Governor
```

This will:
1. Generate a new brand configuration in `branding/brands.config.ts`
2. Create asset directories at `assets/branded/{brand_id}/`
3. Generate campaign documentation

### Required Assets

Each brand requires the following assets in `assets/branded/{brand_id}/`:

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024x1024 | App icon (iOS & Android) |
| `adaptive-icon.png` | 1024x1024 | Android adaptive icon |
| `splash.png` | 1242x2436 | Splash screen |
| `logo.png` | 512x512 | Campaign logo (transparent) |
| `favicon.png` | 512x512 | Web favicon |

## Building

### Development Build

```bash
# Build specific brand for development
npx ts-node scripts/build-branded.ts --brand=uradi360 --env=development

# Build for Android only
npx ts-node scripts/build-branded.ts --brand=demo_kano_2027 --platform=android
```

### Production Build

```bash
# Build all brands for production
npx ts-node scripts/build-branded.ts --all --env=production

# Build specific campaign
npx ts-node scripts/build-branded.ts --brand=demo_kano_2027 --env=production --platform=all
```

### GitHub Actions CI/CD

Automated builds are configured via GitHub Actions:

```yaml
# Manual trigger
gh workflow run build-branded.yml --field brand=demo_kano_2027 --field platform=android

# Tag-based release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## Brand Differences

### Public Version (uradi360)

- **Bundle ID**: `org.uradi360.monitor`
- **Features**:
  - Full public results access
  - Public incident reporting
  - Open to all states
  - Civil society integration
- **Data Access**: All anonymized data visible to public

### Campaign Version

- **Bundle ID**: `org.{campaign}.monitor`
- **Features**:
  - Restricted to campaign volunteers
  - State-restricted data (only their state)
  - Custom branding and colors
  - Campaign-specific analytics
- **Data Access**: Only their campaign's collected data

## Configuration Reference

### BrandConfig Interface

```typescript
interface BrandConfig {
  id: string;                    // Unique brand identifier
  name: string;                  // Short name
  displayName: string;           // Full app name
  type: 'public' | 'campaign';   // App type
  colors: BrandColors;           // Color palette
  assets: BrandAssets;           // Asset paths
  app: AppConfig;                // Bundle configuration
  features: FeatureFlags;        // Enabled features
  metadata: Metadata;            // Store metadata
  campaign?: CampaignConfig;     // Campaign-specific (if type=campaign)
}
```

### Feature Flags

| Flag | Public | Campaign | Description |
|------|--------|----------|-------------|
| `blockchainVerification` | ✅ | ✅ | IPFS + Polygon anchoring |
| `publicResults` | ✅ | ❌ | View all public results |
| `incidentsPublic` | ✅ | ❌ | Public incident feed |
| `customBranding` | ❌ | ✅ | Campaign colors/logos |
| `analytics` | ✅ | ✅ | Usage analytics |

## Distribution

### Public Version

- **Google Play**: Published as "Uradi Monitor"
- **App Store**: Published as "Uradi Monitor"
- **Web**: Available at monitor.uradi360.org

### Campaign Versions

- **Distribution**: Sideload APK / Enterprise distribution
- **Updates**: Via Firebase App Distribution or direct download
- **Training**: Provided to campaign volunteers

## Security & Compliance

### Data Isolation

Each campaign app operates in isolated data space:
- Separate database collections
- State-restricted queries
- Campaign-filtered results

### Exclusivity Principle

> **One campaign per state**: If we sign APC candidate for Kano, we cannot work with PDP or any other party in Kano for 2027 cycle.

This is enforced in:
- Business contracts
- Technical data isolation
- Brand registration (prevents duplicate state registrations)

## Repurposing for Other Causes

The white-label system supports repurposing for other civil society causes:

```typescript
// Example: Gender-Based Violence monitoring
const gbv_brand: BrandConfig = {
  id: 'gbv_watch_2027',
  name: 'GBV Watch',
  displayName: 'GBV Watch Monitor',
  type: 'public',
  // ... reuse election monitoring infrastructure
};
```

## Troubleshooting

### Build Errors

```bash
# Clear caches
rm -rf node_modules build assets/branded/*/node_modules
npm install

# Reset Expo
npx expo prebuild --clean
```

### Asset Issues

Ensure all required assets exist:
```bash
npx ts-node scripts/validate-assets.ts --brand=demo_kano_2027
```

### EAS Build Failures

Check EAS project configuration:
```bash
eas build:configure
```

## License

Copyright © 2027 Uradi360 Initiative. All rights reserved.

Campaign branded versions are licensed to respective campaigns.
