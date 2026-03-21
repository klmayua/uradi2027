#!/usr/bin/env ts-node
/**
 * White-Label Build Script for Uradi Monitor
 * Generates branded APK/IPA files for different campaigns
 *
 * Usage:
 *   npx ts-node scripts/build-branded.ts --brand=demo_kano_2027
 *   npx ts-node scripts/build-branded.ts --brand=uradi360 --platform=android
 *   npx ts-node scripts/build-branded.ts --all --platform=ios
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { BRANDS, BrandConfig, DEFAULT_BRAND } from '../branding/brands.config';

interface BuildOptions {
  brandId: string;
  platform: 'android' | 'ios' | 'all';
  env: 'development' | 'staging' | 'production';
  outputDir: string;
  shouldInstall: boolean;
}

const parseArgs = (): Partial<BuildOptions> => {
  const args = process.argv.slice(2);
  const options: Partial<BuildOptions> = {};

  args.forEach((arg) => {
    if (arg.startsWith('--brand=')) {
      options.brandId = arg.split('=')[1];
    } else if (arg.startsWith('--platform=')) {
      options.platform = arg.split('=')[1] as 'android' | 'ios' | 'all';
    } else if (arg.startsWith('--env=')) {
      options.env = arg.split('=')[1] as 'development' | 'staging' | 'production';
    } else if (arg.startsWith('--output=')) {
      options.outputDir = arg.split('=')[1];
    } else if (arg === '--install') {
      options.shouldInstall = true;
    } else if (arg === '--all') {
      options.brandId = 'ALL';
    }
  });

  return options;
};

class BrandBuilder {
  private options: BuildOptions;

  constructor(options: BuildOptions) {
    this.options = options;
  }

  async build(): Promise<void> {
    console.log(`🚀 Starting branded build for: ${this.options.brandId}`);
    console.log(`📱 Platform: ${this.options.platform}`);
    console.log(`🌍 Environment: ${this.options.env}`);

    const brandsToBuild = this.getBrandsToBuild();

    for (const brand of brandsToBuild) {
      await this.buildBrand(brand);
    }

    console.log('\n✅ All builds completed successfully!');
  }

  private getBrandsToBuild(): BrandConfig[] {
    if (this.options.brandId === 'ALL') {
      return Object.values(BRANDS).filter(b => b.id !== 'campaign_template');
    }
    const brand = BRANDS[this.options.brandId];
    if (!brand) {
      throw new Error(`Brand "${this.options.brandId}" not found in brands.config.ts`);
    }
    return [brand];
  }

  private async buildBrand(brand: BrandConfig): Promise<void> {
    console.log(`\n🏗️  Building ${brand.displayName}...`);

    // Step 1: Validate assets exist
    this.validateAssets(brand);

    // Step 2: Generate app.json
    await this.generateAppJson(brand);

    // Step 3: Generate brand-specific code
    await this.generateBrandCode(brand);

    // Step 4: Run Expo build
    await this.runExpoBuild(brand);

    // Step 5: Move output to branded location
    await this.moveOutput(brand);

    console.log(`✅ ${brand.displayName} build complete!`);
  }

  private validateAssets(brand: BrandConfig): void {
    console.log('  📁 Validating assets...');

    const assetsToCheck = [
      { path: brand.assets.icon, name: 'App Icon' },
      { path: brand.assets.splash, name: 'Splash Screen' },
    ];

    for (const asset of assetsToCheck) {
      const fullPath = path.resolve(__dirname, '..', asset.path);
      if (!fs.existsSync(fullPath)) {
        console.warn(`    ⚠️  ${asset.name} not found: ${asset.path}`);
        console.warn(`       Expected at: ${fullPath}`);
      }
    }
  }

  private async generateAppJson(brand: BrandConfig): Promise<void> {
    console.log('  📝 Generating app.json...');

    const appJson = {
      expo: {
        name: brand.displayName,
        slug: brand.id,
        version: brand.app.version,
        orientation: 'portrait',
        icon: brand.assets.icon,
        userInterfaceStyle: 'dark',
        splash: {
          image: brand.assets.splash,
          resizeMode: 'contain',
          backgroundColor: brand.colors.background,
        },
        assetBundlePatterns: ['**/*'],
        ios: {
          supportsTablet: true,
          bundleIdentifier: brand.app.bundleId,
          buildNumber: brand.app.buildNumber,
          infoPlist: {
            NSCameraUsageDescription: 'This app uses the camera to capture election evidence with forensic metadata.',
            NSLocationWhenInUseUsageDescription: 'Your location is used to verify you are at the polling unit.',
            NSLocationAlwaysUsageDescription: 'Background location is used for election monitoring verification.',
            NSPhotoLibraryUsageDescription: 'Access to photos is needed to attach evidence to reports.',
          },
        },
        android: {
          adaptiveIcon: {
            foregroundImage: brand.assets.adaptiveIcon,
            backgroundColor: brand.colors.background,
          },
          package: brand.app.bundleId,
          versionCode: parseInt(brand.app.buildNumber),
          permissions: [
            'android.permission.CAMERA',
            'android.permission.ACCESS_FINE_LOCATION',
            'android.permission.ACCESS_COARSE_LOCATION',
            'android.permission.ACCESS_BACKGROUND_LOCATION',
            'android.permission.READ_EXTERNAL_STORAGE',
            'android.permission.WRITE_EXTERNAL_STORAGE',
            'android.permission.FOREGROUND_SERVICE',
            'android.permission.FOREGROUND_SERVICE_LOCATION',
          ],
        },
        web: {
          favicon: brand.assets.favicon,
          bundler: 'metro',
        },
        plugins: [
          [
            'expo-camera',
            {
              cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera for evidence capture.',
            },
          ],
          [
            'expo-location',
            {
              locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location for polling unit verification.',
            },
          ],
          [
            'expo-media-library',
            {
              photosPermission: 'Allow $(PRODUCT_NAME) to save evidence photos to your gallery.',
              savePhotosPermission: 'Allow $(PRODUCT_NAME) to save evidence photos to your gallery.',
            },
          ],
        ],
        extra: {
          brandId: brand.id,
          brandType: brand.type,
          eas: {
            projectId: `uradi-${brand.id}`,
          },
        },
      },
    };

    const appJsonPath = path.resolve(__dirname, '..', 'app.json');
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  }

  private async generateBrandCode(brand: BrandConfig): Promise<void> {
    console.log('  💻 Generating brand-specific code...');

    // Generate active brand constant file
    const brandCode = `
// AUTO-GENERATED: Do not edit manually
// Generated by build-branded.ts for ${brand.id}

export const ACTIVE_BRAND_ID = '${brand.id}';
export const ACTIVE_BRAND_NAME = '${brand.displayName}';
export const ACTIVE_BRAND_TYPE = '${brand.type}';
export const IS_CAMPAIGN_MODE = ${brand.type === 'campaign'};
export const IS_PUBLIC_MODE = ${brand.type === 'public'};

// Campaign-specific restrictions
${brand.campaign ? `
export const RESTRICTED_STATES = ${JSON.stringify(brand.campaign.authorizedStates)};
export const CAMPAIGN_CANDIDATE = '${brand.campaign.candidateName}';
export const CAMPAIGN_POSITION = '${brand.campaign.position}';
export const CAMPAIGN_STATE = '${brand.campaign.state}';
` : '
export const RESTRICTED_STATES: string[] = [];
export const CAMPAIGN_CANDIDATE = null;
export const CAMPAIGN_POSITION = null;
export const CAMPAIGN_STATE = null;
'}
`;

    const brandConstPath = path.resolve(__dirname, '..', 'src', 'constants', 'brand.ts');
    fs.mkdirSync(path.dirname(brandConstPath), { recursive: true });
    fs.writeFileSync(brandConstPath, brandCode.trim());
  }

  private async runExpoBuild(brand: BrandConfig): Promise<void> {
    console.log('  🔨 Running Expo build...');

    const platform = this.options.platform === 'all' ? 'android' : this.options.platform;

    try {
      // Set environment variable for brand
      process.env.EXPO_PUBLIC_BRAND_ID = brand.id;
      process.env.EXPO_PUBLIC_ENV = this.options.env;

      if (this.options.env === 'production') {
        // EAS Build for production
        const profile = platform === 'ios' ? 'production' : 'production';
        execSync(
          `npx eas build --platform ${platform} --profile ${profile} --non-interactive`,
          { stdio: 'inherit', cwd: path.resolve(__dirname, '..') }
        );
      } else {
        // Local development build
        const outputFile = platform === 'android'
          ? `build-${brand.id}.apk`
          : `build-${brand.id}.ipa`;

        execSync(
          `npx expo prebuild --clean && npx expo run:${platform} --variant release`,
          { stdio: 'inherit', cwd: path.resolve(__dirname, '..') }
        );
      }
    } catch (error) {
      console.error(`Build failed for ${brand.id}:`, error);
      throw error;
    }
  }

  private async moveOutput(brand: BrandConfig): Promise<void> {
    console.log('  📦 Moving output...');

    const outputDir = path.resolve(__dirname, '..', this.options.outputDir, brand.id);
    fs.mkdirSync(outputDir, { recursive: true });

    // Copy build artifacts to output directory
    // Actual paths depend on build output
    console.log(`     Output: ${outputDir}`);
  }
}

// CLI Entry Point
const run = async (): Promise<void> => {
  const args = parseArgs();

  const options: BuildOptions = {
    brandId: args.brandId || DEFAULT_BRAND,
    platform: args.platform || 'android',
    env: args.env || 'production',
    outputDir: args.outputDir || './builds',
    shouldInstall: args.shouldInstall || false,
  };

  const builder = new BrandBuilder(options);
  await builder.build();
};

run().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
