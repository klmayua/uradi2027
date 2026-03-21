# Uradi Monitor - Production Readiness Checklist

## Pre-Deployment

### Environment Setup
- [ ] Copy `.env.example` to `.env`
- [ ] Set `EXPO_PUBLIC_ENV=production`
- [ ] Configure production API URL
- [ ] Set Polygon mainnet RPC endpoint
- [ ] Add smart contract address
- [ ] Configure Sentry DSN for error tracking
- [ ] Add Firebase configuration (if using analytics)

### Backend Verification
- [ ] API endpoints tested and live
- [ ] Database migrations applied
- [ ] Sync endpoints functional
- [ ] Blockchain contract deployed and verified
- [ ] IPFS pinning service configured

### Security
- [ ] `.env` added to `.gitignore`
- [ ] No hardcoded secrets in source code
- [ ] API keys rotated for production
- [ ] SSL certificates valid for API domain
- [ ] Rate limiting enabled on backend

### Assets
- [ ] App icon (1024x1024) created
- [ ] Splash screen (1242x2436) created
- [ ] Adaptive icon for Android created
- [ ] Screenshots for app stores prepared
- [ ] App description and metadata written

## Build

### Development Build
```bash
npx expo prebuild --clean
npx expo run:android --variant release
npx expo run:ios --configuration Release
```

### Production Build (EAS)
```bash
# Android AAB for Play Store
npx eas build --profile production --platform android

# iOS IPA for App Store
npx eas build --profile production --platform ios

# Both platforms
npx eas build --profile production --platform all
```

### White-Label Campaign Builds
```bash
# Create campaign
npx ts-node scripts/create-campaign.ts

# Build branded version
npx ts-node scripts/build-branded.ts --brand={CAMPAIGN_ID} --env=production
```

## Testing

### Device Testing
- [ ] Physical Android device tested
- [ ] Physical iOS device tested
- [ ] Offline mode verified
- [ ] Sync functionality tested
- [ ] Camera capture tested
- [ ] GPS accuracy verified
- [ ] Blockchain anchoring tested

### User Acceptance Testing
- [ ] Field agents trained
- [ ] Check-in workflow validated
- [ ] Evidence capture workflow validated
- [ ] Results submission tested
- [ ] Incident reporting tested

## Deployment

### Google Play Store
1. Create developer account ($25 one-time)
2. Create app listing
3. Upload AAB from EAS build
4. Complete content rating questionnaire
5. Add privacy policy URL
6. Submit for review (1-3 days)

### Apple App Store
1. Enroll in Apple Developer Program ($99/year)
2. Create app in App Store Connect
3. Upload IPA via Transporter
4. Complete app information
5. Submit for review (1-2 days)

### Campaign Distribution
1. Generate APK via build script
2. Upload to Firebase App Distribution
3. Send download links to campaign volunteers
4. Provide installation instructions

## Post-Deployment

### Monitoring
- [ ] Sentry alerts configured
- [ ] Firebase Analytics enabled
- [ ] Backend monitoring dashboards active
- [ ] Error rates within acceptable thresholds

### Support
- [ ] Support email configured
- [ ] FAQ documentation published
- [ ] Training materials distributed
- [ ] WhatsApp/Telegram support groups created

### Backup
- [ ] Database backups scheduled
- [ ] Blockchain evidence backup verified
- [ ] Disaster recovery plan documented

## Election Day Readiness

### Infrastructure
- [ ] Backend scaled for traffic
- [ ] CDN configured for image delivery
- [ ] Load balancers tested
- [ ] Failover procedures documented

### Operations
- [ ] On-call rotation established
- [ ] Emergency contacts documented
- [ ] Real-time monitoring active
- [ ] Communication channels open

---

**Status**: ☐ Ready for Production

**Sign-off**:
- Technical Lead: _________________ Date: _______
- Product Owner: _________________ Date: _______
- Security Review: _________________ Date: _______
