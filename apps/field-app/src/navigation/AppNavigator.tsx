import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '@screens/auth/LoginScreen';
import OnboardingScreen from '@screens/auth/OnboardingScreen';

// Main Screens
import PollingUnitListScreen from '@screens/polling/PollingUnitListScreen';
import PollingUnitDetailScreen from '@screens/polling/PollingUnitDetailScreen';
import CheckInScreen from '@screens/polling/CheckInScreen';

import EvidenceCaptureScreen from '@screens/evidence/EvidenceCaptureScreen';
import EvidencePreviewScreen from '@screens/evidence/EvidencePreviewScreen';
import EvidenceVerificationScreen from '@screens/evidence/EvidenceVerificationScreen';

import AccreditationScreen from '@screens/election/AccreditationScreen';
import ResultsScreen from '@screens/election/ResultsScreen';
import IncidentsScreen from '@screens/election/IncidentsScreen';

import ProfileScreen from '@screens/profile/ProfileScreen';

import SyncStatus from '@components/Sync/SyncStatus';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PollingUnitDetail: { puId: string };
  CheckIn: { puId: string };
  EvidenceCapture: { puId: string; evidenceType: string };
  EvidencePreview: { imageUri: string; metadata: any };
  EvidenceVerification: { evidenceId: string };
  Accreditation: { puId: string };
  Results: { puId: string };
  Incidents: { puId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#000000' },
    }}
  >
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home';

        if (route.name === 'Home') {
          iconName = focused ? 'map' : 'map-outline';
        } else if (route.name === 'Evidence') {
          iconName = focused ? 'camera' : 'camera-outline';
        } else if (route.name === 'Election') {
          iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#D4AF37',
      tabBarInactiveTintColor: '#666666',
      tabBarStyle: {
        backgroundColor: '#111111',
        borderTopColor: '#222222',
      },
      headerShown: false,
    })}
  >
    <Tab.Screen
      name="Home"
      component={PollingUnitListScreen}
      options={{ title: 'Polling Units' }}
    />
    <Tab.Screen
      name="Evidence"
      component={EvidenceCaptureScreen}
      options={{ title: 'Evidence' }}
    />
    <Tab.Screen
      name="Election"
      component={AccreditationScreen}
      options={{ title: 'Election' }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

// Main Stack (includes tabs and modal screens)
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#000000' },
      headerTintColor: '#D4AF37',
      headerTitleStyle: { color: '#FFFFFF' },
      contentStyle: { backgroundColor: '#000000' },
    }}
  >
    <Stack.Screen
      name="MainTabs"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PollingUnitDetail"
      component={PollingUnitDetailScreen}
      options={{ title: 'Polling Unit Details' }}
    />
    <Stack.Screen
      name="CheckIn"
      component={CheckInScreen}
      options={{ title: 'Check In', presentation: 'modal' }}
    />
    <Stack.Screen
      name="EvidenceCapture"
      component={EvidenceCaptureScreen}
      options={{ title: 'Capture Evidence', presentation: 'modal' }}
    />
    <Stack.Screen
      name="EvidencePreview"
      component={EvidencePreviewScreen}
      options={{ title: 'Review Evidence' }}
    />
    <Stack.Screen
      name="EvidenceVerification"
      component={EvidenceVerificationScreen}
      options={{ title: 'Blockchain Verification' }}
    />
    <Stack.Screen
      name="Accreditation"
      component={AccreditationScreen}
      options={{ title: 'Accreditation Report' }}
    />
    <Stack.Screen
      name="Results"
      component={ResultsScreen}
      options={{ title: 'Vote Tally' }}
    />
    <Stack.Screen
      name="Incidents"
      component={IncidentsScreen}
      options={{ title: 'Report Incident' }}
    />
  </Stack.Navigator>
);

// Root Navigator
interface AppNavigatorProps {
  isAuthenticated: boolean;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ isAuthenticated }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainStack} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
