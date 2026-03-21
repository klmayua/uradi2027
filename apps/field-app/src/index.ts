/**
 * Uradi Monitor - Field Application
 * Exports for library usage
 */

// Components
export { default as SyncStatus } from './components/Sync/SyncStatus';

// Screens
export { default as LoginScreen } from './screens/auth/LoginScreen';
export { default as OnboardingScreen } from './screens/auth/OnboardingScreen';
export { default as PollingUnitListScreen } from './screens/polling/PollingUnitListScreen';
export { default as PollingUnitDetailScreen } from './screens/polling/PollingUnitDetailScreen';
export { default as CheckInScreen } from './screens/polling/CheckInScreen';
export { default as EvidenceCaptureScreen } from './screens/evidence/EvidenceCaptureScreen';
export { default as EvidencePreviewScreen } from './screens/evidence/EvidencePreviewScreen';
export { default as EvidenceVerificationScreen } from './screens/evidence/EvidenceVerificationScreen';
export { default as ResultsScreen } from './screens/election/ResultsScreen';
export { default as AccreditationScreen } from './screens/election/AccreditationScreen';
export { default as IncidentsScreen } from './screens/election/IncidentsScreen';
export { default as ProfileScreen } from './screens/profile/ProfileScreen';

// Services
export { default as apiService } from './services/api';
export { blockchainService } from './services/blockchain';
export { getCurrentLocation, calculateDistance, isWithinPollingUnit } from './services/gps';
export { syncService } from './services/sync';

// Stores
export { default as useAuthStore } from './stores/authStore';
export { default as useSyncStore } from './stores/syncStore';

// Database
export { getDatabase, databaseProvider } from './database';
export { schema } from './database/schema';
export { default as Evidence } from './models/Evidence';
export { default as PollingUnit } from './models/PollingUnit';
export { default as CheckIn } from './models/CheckIn';
export { default as VoteTally } from './models/VoteTally';
export { default as AccreditationRecord } from './models/AccreditationRecord';
export { default as Incident } from './models/Incident';

// Theme
export { getTheme, useBrandTheme, brandStyles } from './theme/brandTheme';

// Navigation
export { default as AppNavigator } from './navigation/AppNavigator';

// Version
export const VERSION = '1.0.0';
export const BUILD_NUMBER = '1';
