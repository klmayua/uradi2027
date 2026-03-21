# Uradi Field App

## Overview
Mobile application for election monitoring with blockchain-verified evidence capture.

## Features
- 📍 GPS-verified polling unit check-in
- 📸 Forensic image capture with blockchain anchoring
- 🔄 Offline-first with automatic sync
- 🗳️ Real-time accreditation and results tracking
- 🚨 Incident reporting

## Tech Stack
- React Native + Expo
- TypeScript
- WatermelonDB (offline database)
- Zustand (state management)
- Ethers.js (blockchain)
- IPFS (decentralized storage)

## Project Structure
```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── services/       # API, blockchain, GPS services
├── stores/         # Zustand state stores
├── database/       # WatermelonDB schema and setup
├── hooks/          # Custom React hooks
├── utils/          # Helper functions
└── navigation/     # Navigation configuration
```

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Environment Variables

Create `.env` file:
```
EXPO_PUBLIC_API_URL=https://api.uradi360.io
EXPO_PUBLIC_IPFS_HOST=ipfs.infura.io
EXPO_PUBLIC_IPFS_PROJECT_ID=your_project_id
EXPO_PUBLIC_IPFS_SECRET=your_secret
EXPO_PUBLIC_POLYGON_RPC=https://polygon-rpc.com
EXPO_PUBLIC_CONTRACT_ADDRESS=0x...
```

## Building

```bash
# Build for Android
npm run build:android

# Build for iOS
npm run build:ios
```

## Testing

```bash
npm test
```

## License
Proprietary - Uradi Strategic Group
