import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import AppNavigator from '@navigation/AppNavigator';
import { initDatabase } from '@database';
import useAuthStore from '@stores/authStore';
import useSyncStore from '@stores/syncStore';
import { blockchainService } from '@services/blockchain';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Require cycle:',
]);

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const { checkAuth, isLoading, isAuthenticated } = useAuthStore();
  const { checkOnline } = useSyncStore();

  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. Initialize database
        initDatabase();

        // 2. Check authentication
        await checkAuth();

        // 3. Check online status
        await checkOnline();

        // 4. Initialize blockchain (optional)
        try {
          await blockchainService.initialize();
        } catch {
          console.log('Blockchain not initialized (optional)');
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsReady(true);
      }
    };

    initialize();
  }, []);

  if (!isReady || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator isAuthenticated={isAuthenticated} />
        <StatusBar style="auto" />
        <Toast />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});
