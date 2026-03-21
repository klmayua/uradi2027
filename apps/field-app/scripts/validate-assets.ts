#!/usr/bin/env ts-node
/**
 * Asset Validation Script
 * Verifies all required brand assets exist and meet specifications
 */

import * as fs from 'fs';
import * as path from 'path';
import { BRANDS } from '../branding/brands.config';

interface ValidationResult {
  brand: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_ASSETS = [
  { name: 'icon.png', minSize: 1024, required: true },
  { name: 'adaptive-icon.png', minSize: 1024, required: false },
  { name: 'splash.png', minSize: 1242, required: true },
  { name: 'logo.png', minSize: 512, required: true },
  { name: 'favicon.png', minSize: 512, required: false },
];

const validateBrand = async (brandId: string): Promise<ValidationResult> = {
  const brand = BRANDS[brandId];
  const result: ValidationResult = {
    brand: brandId,
    valid: true,
    errors: [],
    warnings: [],
  };

  if (!brand) {
    result.valid = false;
    result.errors.push(`Brand "${brandId}" not found in configuration`);
    return result;
  }

  // Skip template
  if (brandId === 'campaign_template') {
    result.warnings.push('Template brand - no assets required');
    return result;
  }

  const assetsDir = path.resolve(__dirname, '..', 'assets', 'branded', brandId);

  // Check if brand directory exists
  if (!fs.existsSync(assetsDir)) {
    // Public brand uses different path
    const publicAssetsDir = path.resolve(__dirname, '..', 'assets', 'uradi');
    if (brandId === 'uradi360' && fs.existsSync(publicAssetsDir)) {
      // Validate public assets
      for (const asset of REQUIRED_ASSETS) {
        const assetPath = path.join(publicAssetsDir, asset.name);
        if (!fs.existsSync(assetPath)) {
          if (asset.required) {
            result.valid = false;
            result.errors.push(`Missing required asset: ${asset.name}`);
          } else {
            result.warnings.push(`Missing optional asset: ${asset.name}`);
          }
        }
      }
      return result;
    }

    result.valid = false;
    result.errors.push(`Assets directory not found: ${assetsDir}`);
    return result;
  }

  // Validate each asset
  for (const asset of REQUIRED_ASSETS) {
    const assetPath = path.join(assetsDir, asset.name);

    if (!fs.existsSync(assetPath)) {
      if (asset.required) {
        result.valid = false;
        result.errors.push(`Missing required asset: ${asset.name}`);
      } else {
        result.warnings.push(`Missing optional asset: ${asset.name}`);
      }
      continue;
    }

    // Check file size (basic check for images)
    const stats = fs.statSync(assetPath);
    if (stats.size === 0) {
      result.valid = false;
      result.errors.push(`${asset.name} is empty (0 bytes)`);
    }

    // Note: For full validation, we'd need sharp or similar to check dimensions
    // This is a basic existence check
  }

  return result;
};

const main = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const brandFilter = args.find((arg) => arg.startsWith('--brand='))?.split('=')[1];

  console.log('🔍 Uradi Monitor - Asset Validation\n');

  const brandsToValidate = brandFilter
    ? [brandFilter]
    : Object.keys(BRANDS).filter((id) => id !== 'campaign_template');

  const results: ValidationResult[] = [];

  for (const brandId of brandsToValidate) {
    const result = await validateBrand(brandId);
    results.push(result);

    // Print results
    const status = result.valid ? '✅' : '❌';
    console.log(`${status} ${BRANDS[brandId]?.displayName || brandId}`);

    if (result.errors.length > 0) {
      result.errors.forEach((err) => console.log(`   ❌ ${err}`));
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach((warn) => console.log(`   ⚠️  ${warn}`));
    }

    if (result.valid && result.errors.length === 0 && result.warnings.length === 0) {
      console.log('   ✓ All assets valid');
    }
  }

  // Summary
  const validCount = results.filter((r) => r.valid).length;
  const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);

  console.log('\n' + '='.repeat(50));
  console.log(`Validated ${results.length} brands`);
  console.log(`✅ ${validCount} valid`);
  console.log(`❌ ${errorCount} errors`);
  console.log('='.repeat(50));

  if (errorCount > 0) {
    process.exit(1);
  }
};

main().catch((error) => {
  console.error('Validation failed:', error);
  process.exit(1);
});
