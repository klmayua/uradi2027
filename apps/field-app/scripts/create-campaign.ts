#!/usr/bin/env ts-node
/**
 * Campaign Onboarding Script
 * Creates new branded campaign configurations for governorship candidates
 *
 * Usage:
 *   npx ts-node scripts/create-campaign.ts --name="Alhaji Sanusi" --state=Kano --party=NNPP --position=Governor
 *   npx ts-node scripts/create-campaign.ts --name="Dr. Ifeanyi" --state=Anambra --party=APGA --position=Governor --primary-color="#1B5E20"
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

interface CampaignInput {
  candidateName: string;
  position: string;
  state: string;
  party?: string;
  slogan?: string;
  primaryColor?: string;
  secondaryColor?: string;
  website?: string;
  email?: string;
}

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
];

const MAJOR_PARTIES = ['APC', 'PDP', 'LP', 'NNPP', 'APGA', 'SDP', 'YPP', 'ADC', 'Others'];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
};

const validateColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

const generateBrandId = (name: string, state: string): string => {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanState = state.toLowerCase().replace(/[^a-z0-9]/g, '');
  const year = new Date().getFullYear() + 1; // Assuming 2027 elections
  return `${cleanState}_${year}_${cleanName.substring(0, 10)}`;
};

const createCampaign = async (): Promise<void> => {
  console.log('🏛️  URADI MONITOR - Campaign Onboarding\n');
  console.log('This will create a branded monitoring app for a governorship candidate.\n');

  const input: CampaignInput = {
    candidateName: '',
    position: 'Governor',
    state: '',
  };

  // Candidate Name
  while (!input.candidateName) {
    input.candidateName = await ask('Candidate full name: ');
    if (!input.candidateName) {
      console.log('❌ Candidate name is required');
    }
  }

  // Position (default to Governor)
  const positionInput = await ask('Position [Governor]: ');
  input.position = positionInput || 'Governor';

  // State
  console.log('\nAvailable states:');
  NIGERIAN_STATES.forEach((state, i) => {
    process.stdout.write(`${state.padEnd(15)}${(i + 1) % 4 === 0 ? '\n' : '  '}`);
  });
  console.log();

  while (!input.state || !NIGERIAN_STATES.includes(input.state)) {
    input.state = await ask('State: ');
    if (!NIGERIAN_STATES.includes(input.state)) {
      console.log(`❌ Invalid state. Please choose from the list above.`);
    }
  }

  // Party
  console.log('\nMajor parties:', MAJOR_PARTIES.join(', '));
  input.party = await ask('Political party: ');

  // Slogan
  input.slogan = await ask('Campaign slogan (optional): ');

  // Colors
  console.log('\n🎨 Brand Colors');
  console.log('Enter hex colors (e.g., #D4AF37 for gold)');

  while (!input.primaryColor || !validateColor(input.primaryColor)) {
    input.primaryColor = await ask('Primary color [#D4AF37]: ');
    input.primaryColor = input.primaryColor || '#D4AF37';
    if (!validateColor(input.primaryColor)) {
      console.log('❌ Invalid hex color. Format: #RRGGBB');
    }
  }

  const secondaryDefault = '#008751';
  input.secondaryColor = await ask(`Secondary color [${secondaryDefault}]: `);
  input.secondaryColor = input.secondaryColor || secondaryDefault;

  // Contact
  console.log('\n📧 Contact Information');
  input.website = await ask('Campaign website (optional): ');
  input.email = await ask('Support email (optional): ');

  // Confirmation
  const brandId = generateBrandId(input.candidateName, input.state);

  console.log('\n' + '='.repeat(50));
  console.log('CAMPAIGN CONFIGURATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Brand ID:        ${brandId}`);
  console.log(`Candidate:       ${input.candidateName}`);
  console.log(`Position:        ${input.position} of ${input.state}`);
  console.log(`Party:           ${input.party || 'Not specified'}`);
  console.log(`Slogan:          ${input.slogan || 'Not specified'}`);
  console.log(`Primary Color:   ${input.primaryColor}`);
  console.log(`Secondary Color: ${input.secondaryColor}`);
  console.log(`Website:         ${input.website || 'Not specified'}`);
  console.log(`Email:           ${input.email || 'Not specified'}`);
  console.log('='.repeat(50));

  const confirm = await ask('\nCreate this campaign? [y/N]: ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Cancelled');
    rl.close();
    return;
  }

  // Generate brand configuration
  const brandConfig = generateBrandConfig(brandId, input);

  // Save to brands.config.ts
  await appendBrandToConfig(brandId, brandConfig);

  // Create asset directories
  await createAssetDirectories(brandId);

  // Generate documentation
  await generateCampaignDocs(brandId, input);

  console.log('\n✅ Campaign created successfully!');
  console.log(`\nNext steps:`);
  console.log(`1. Add brand assets to: assets/branded/${brandId}/`);
  console.log(`   - icon.png (1024x1024)`);
  console.log(`   - adaptive-icon.png (1024x1024)`);
  console.log(`   - splash.png (1242x2436)`);
  console.log(`   - logo.png (transparent PNG)`);
  console.log(`2. Build the app: npx ts-node scripts/build-branded.ts --brand=${brandId}`);
  console.log(`3. Distribute APK to campaign volunteers\n`);

  rl.close();
};

const generateBrandConfig = (brandId: string, input: CampaignInput): string => {
  const displayName = input.candidateName.split(' ').slice(-1)[0] + ' Monitor';
  const shortName = input.candidateName.split(' ')[0].toLowerCase() + '2027';

  return `${brandId}: {
    id: '${brandId}',
    name: '${displayName}',
    displayName: '${input.candidateName} Monitor',
    description: 'Official election monitoring for ${input.state} State ${input.position} 2027',
    type: 'campaign',
    colors: {
      primary: '${input.primaryColor}',
      secondary: '${input.secondaryColor}',
      accent: '#FFFFFF',
      background: '#000000',
      surface: '#111111',
      text: '#FFFFFF',
      success: '#00FF00',
      warning: '#FFA500',
      error: '#FF0000',
    },
    assets: {
      icon: './assets/branded/${brandId}/icon.png',
      adaptiveIcon: './assets/branded/${brandId}/adaptive-icon.png',
      splash: './assets/branded/${brandId}/splash.png',
      logo: './assets/branded/${brandId}/logo.png',
      favicon: './assets/branded/${brandId}/favicon.png',
    },
    app: {
      bundleId: 'org.${shortName}.monitor',
      scheme: '${shortName}',
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
      author: '${input.candidateName} Campaign',
      website: '${input.website || `https://${shortName}.ng`}',
      privacyPolicy: '${input.website || `https://${shortName}.ng`}/privacy',
      termsOfService: '${input.website || `https://${shortName}.ng`}/terms',
      supportEmail: '${input.email || `tech@${shortName}.ng`}',
    },
    campaign: {
      candidateName: '${input.candidateName}',
      position: '${input.position}',
      state: '${input.state}',
      party: '${input.party}',
      slogan: '${input.slogan || `${input.state} First`}',
      authorizedStates: ['${input.state}'],
      restrictToStates: true,
    },
  },`;
};

const appendBrandToConfig = async (brandId: string, brandConfig: string): Promise<void> => {
  const configPath = path.resolve(__dirname, '..', 'branding', 'brands.config.ts');
  let content = fs.readFileSync(configPath, 'utf-8');

  // Find the position to insert (before the closing brace of BRANDS)
  const insertPosition = content.lastIndexOf('};');
  if (insertPosition === -1) {
    throw new Error('Could not find insertion point in brands.config.ts');
  }

  content = content.slice(0, insertPosition) + '\n  ' + brandConfig + '\n' + content.slice(insertPosition);

  fs.writeFileSync(configPath, content);
  console.log(`  ✅ Added ${brandId} to brands.config.ts`);
};

const createAssetDirectories = async (brandId: string): Promise<void> => {
  const assetsDir = path.resolve(__dirname, '..', 'assets', 'branded', brandId);
  fs.mkdirSync(assetsDir, { recursive: true });

  // Create README for assets
  const readme = `# ${brandId} Brand Assets

Required files:
- icon.png (1024x1024) - App icon
- adaptive-icon.png (1024x1024) - Android adaptive icon
- splash.png (1242x2436) - Splash screen
- logo.png (transparent PNG) - Campaign logo
- favicon.png (512x512) - Web favicon

Place all assets in this directory.
`;

  fs.writeFileSync(path.join(assetsDir, 'README.md'), readme);
  console.log(`  ✅ Created assets directory: ${assetsDir}`);
};

const generateCampaignDocs = async (brandId: string, input: CampaignInput): Promise<void> => {
  const docsDir = path.resolve(__dirname, '..', 'docs', 'campaigns');
  fs.mkdirSync(docsDir, { recursive: true });

  const doc = `# ${input.candidateName} Campaign App

## Configuration
- **Brand ID:** ${brandId}
- **Candidate:** ${input.candidateName}
- **Position:** ${input.position} of ${input.state}
- **Party:** ${input.party || 'N/A'}

## Features
- Blockchain-verified evidence capture
- GPS-verified polling unit check-ins
- Real-time results tracking
- Incident reporting
- Offline-first with sync

## Build Instructions
\`\`\`bash
# Development build
npx ts-node scripts/build-branded.ts --brand=${brandId} --env=development

# Production build
npx ts-node scripts/build-branded.ts --brand=${brandId} --env=production --platform=all
\`\`\`

## Distribution
1. Generate APK/IPA using build script
2. Test on physical devices
3. Distribute to campaign volunteers
4. Provide training on evidence capture

## Support
Contact: ${input.email || 'tech@campaign.ng'}
`;

  fs.writeFileSync(path.join(docsDir, `${brandId}.md`), doc);
  console.log(`  ✅ Created campaign documentation`);
};

// Run if called directly
if (require.main === module) {
  createCampaign().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}
