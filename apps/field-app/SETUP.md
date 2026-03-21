# Uradi Monitor - Setup Guide

Complete setup instructions for the Uradi Monitor field application.

## Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)
- Android Studio (for Android builds)
- Xcode 15+ (for iOS builds, macOS only)
- Git

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/klmayua/Uradi360
cd Uradi360_Build/apps/field-app

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your configuration

# 4. Start development server
npx expo start

# 5. Run on device/emulator
# Press 'a' for Android
# Press 'i' for iOS (macOS only)
# Press 'w' for web
```

## Environment Configuration

Create a `.env` file in the project root:

```env
# Environment
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_BRAND_ID=uradi360

# API Configuration
EXPO_PUBLIC_API_URL=https://api.uradi360.org
EXPO_PUBLIC_API_VERSION=v1

# Blockchain (Polygon Mumbai testnet for dev)
EXPO_PUBLIC_POLYGON_RPC=https://rpc-mumbai.maticvigil.com
EXPO_PUBLIC_CONTRACT_ADDRESS=0x...
EXPO_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs

# Firebase (for campaign distribution)
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...

# Sentry (error tracking)
EXPO_PUBLIC_SENTRY_DSN=...

# Mapbox (for maps)
EXPO_PUBLIC_MAPBOX_TOKEN=...
```

## Development

### Running Locally

```bash
# Start Metro bundler
npx expo start

# Run on specific platform
npx expo run:android
npx expo run:ios

# Clear cache if issues occur
npx expo start --clear
```

### Testing Different Brands

```bash
# Public version
EXPO_PUBLIC_BRAND_ID=uradi360 npx expo start

# Campaign version
EXPO_PUBLIC_BRAND_ID=demo_kano_2027 npx expo start
```

### Testing Offline Sync

1. Enable airplane mode on device
2. Perform actions (check-ins, evidence capture)
3. Disable airplane mode
4. Watch sync status component for upload

## Building for Production

### Local Builds

```bash
# Android APK
npx expo run:android --variant release

# iOS IPA (macOS only)
npx expo run:ios --configuration Release
```

### EAS Cloud Builds

```bash
# Login to Expo
npx eas login

# Configure project
npx eas build:configure

# Development build
npx eas build --profile development --platform android

# Preview build (internal distribution)
npx eas build --profile preview --platform android

# Production build (Play Store)
npx eas build --profile production --platform android

# Build for all platforms
npx eas build --profile production --platform all
```

### White-Label Branded Builds

```bash
# Interactive campaign creation
npx ts-node scripts/create-campaign.ts

# Build specific campaign
npx ts-node scripts/build-branded.ts --brand=demo_kano_2027 --env=production

# Build all campaigns
npx ts-node scripts/build-branded.ts --all --env=production
```

## Project Structure

```
apps/field-app/
├── branding/
│   └── brands.config.ts          # White-label brand definitions
├── src/
│   ├── components/
│   │   ├── Sync/
│   │   │   └── SyncStatus.tsx    # Real-time sync indicator
│   │   └── common/               # Shared UI components
│   ├── constants/
│   │   └── brand.ts              # Auto-generated active brand
│   ├── database/
│   │   ├── index.ts              # WatermelonDB setup
││   ├── schema.ts               # Database schema
│   │   └── migrations/           # DB migrations
│   ├── models/                   # WatermelonDB models
│   │   ├── Evidence.ts
│   │   ├── PollingUnit.ts
│   │   ├── CheckIn.ts
│   │   └── ...
│   ├── navigation/
│   │   └── AppNavigator.tsx      # Navigation setup
│   ├── screens/
│   │   ├── auth/                 # Login, Onboarding
│   │   ├── polling/              # PU List, Detail, Check-in
│   │   ├── evidence/             # Capture, Preview, Verification
│   │   ├── election/              # Results, Incidents, Accreditation
│   │   └── profile/              # Profile, Settings
│   ├── services/
│   │   ├── api.ts                # Backend API client
│   │   ├── blockchain.ts         # IPFS + Polygon
│   │   ├── gps.ts                # GPS utilities
│   │   └── sync.ts               # WatermelonDB sync
│   ├── stores/
│   │   ├── authStore.ts          # Zustand auth state
│   │   └── syncStore.ts          # Zustand sync state
│   ├── theme/
│   │   └── brandTheme.ts         # Dynamic brand theming
│   └── utils/
│       ├── encryption.ts         # Local encryption
│       ├── forensic.ts          # Forensic metadata
│       └── validation.ts         # Input validation
├── scripts/
│   ├── build-branded.ts         # White-label build script
│   ├── create-campaign.ts       # Campaign onboarding
│   └── validate-assets.ts       # Asset validation
├── assets/
│   ├── uradi/                    # Public brand assets
│   └── branded/                  # Campaign brand assets
├── docs/
│   ├── WHITE-LABEL.md           # White-label documentation
│   └── campaigns/               # Campaign-specific docs
├── app.json                      # Expo configuration (generated)
├── eas.json                      # EAS build profiles
└── package.json
```

## Key Features

### GPS-Verified Check-ins
- Haversine distance calculation
- Device fingerprinting
- NTP timestamp verification
- 100-meter accuracy threshold

### Blockchain Evidence
- SHA-256 image hashing
- IPFS decentralized storage
- Polygon blockchain anchoring
- PolygonScan verification

### Offline-First Architecture
- WatermelonDB local storage
- Optimistic UI updates
- Background sync queue
- Conflict resolution

### Dual Mode Support
- Public CSR version
- Campaign branded versions
- Dynamic theming
- Feature flags per brand

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests (Detox)
npm run e2e:android
npm run e2e:ios

# Test specific file
npm test -- src/services/gps.test.ts
```

## Troubleshooting

### Metro bundler issues
```bash
npx expo start --clear
```

### Android build fails
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

### iOS build fails
```bash
cd ios
pod deintegrate
pod install
cd ..
npx expo run:ios
```

### Database issues
```bash
# Clear local database
adb shell pm clear org.uradi360.monitor

# Or reinstall app
```

### Sync not working
- Check network connection
- Verify API_URL in .env
- Check auth token in SecureStore
- Review sync logs in console

## Deployment

### Google Play Store

1. Build AAB: `npx eas build --profile production --platform android`
2. Download AAB from EAS dashboard
3. Upload to Google Play Console
4. Complete store listing
5. Submit for review

### Apple App Store

1. Build IPA: `npx eas build --profile production --platform ios`
2. Download IPA from EAS dashboard
3. Upload via Transporter app
4. Complete App Store Connect listing
5. Submit for review

### Campaign Distribution

```bash
# Generate APK for sideloading
npx ts-node scripts/build-branded.ts --brand=demo_kano_2027 --env=production --platform=android

# Upload to Firebase App Distribution
e firebase appdistribution:distribute builds/demo_kano_2027/*.apk --app $APP_ID --groups "volunteers"
```

## Security

### Data Protection
- Local SQLite encryption (SQLCipher)
- Secure token storage (Expo SecureStore)
- Certificate pinning for API
- Biometric authentication option

### Evidence Integrity
- Cryptographic image hashing
- Blockchain timestamp anchoring
- Tamper-evident metadata
- Forensic chain of custody

## Support

- **Documentation**: https://docs.uradi360.org
- **Issues**: https://github.com/klmayua/Uradi360/issues
- **Email**: tech@uradi360.org
- **Slack**: uradi360.slack.com

## License

Copyright © 2027 Uradi360 Initiative. All rights reserved.

---

**Built with** ❤️ **for Nigerian Democracy**
