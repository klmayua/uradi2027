import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '@services/api';
import { getDatabase, User } from '@database';

interface AuthState {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  token: string | null;

  // Actions
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (updates: Partial<any>) => void;
}

// Secure storage adapter for Zustand
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: true,
      user: null,
      token: null,

      // Login action
      login: async (phone: string, otp: string) => {
        try {
          const response = await apiService.login(phone, otp);

          // Save user to local database
          const db = getDatabase();
          await db.write(async () => {
            const usersCollection = db.get('users');

            // Check if user exists
            const existingUsers = await usersCollection.query().fetch();
            const existingUser = existingUsers[0];

            if (existingUser) {
              await existingUser.update((record: any) => {
                record.remoteId = response.user.id;
                record.email = response.user.email;
                record.fullName = response.user.full_name;
                record.phone = response.user.phone;
                record.role = response.user.role;
                record.assignedLga = response.user.assigned_lga;
                record.lastLogin = new Date();
                record.syncStatus = 'synced';
              });
            } else {
              await usersCollection.create((record: any) => {
                record.remoteId = response.user.id;
                record.email = response.user.email;
                record.fullName = response.user.full_name;
                record.phone = response.user.phone;
                record.role = response.user.role;
                record.assignedLga = response.user.assigned_lga;
                record.token = response.token;
                record.isActive = true;
                record.lastLogin = new Date();
                record.createdAt = new Date();
                record.updatedAt = new Date();
                record.syncStatus = 'synced';
              });
            }
          });

          set({
            isAuthenticated: true,
            user: response.user,
            token: response.token,
          });
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        try {
          await apiService.logout();

          // Clear local database user
          const db = getDatabase();
          await db.write(async () => {
            const users = await db.get('users').query().fetch();
            for (const user of users) {
              await user.destroyPermanently();
            }
          });

          set({
            isAuthenticated: false,
            user: null,
            token: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Still clear local state
          set({
            isAuthenticated: false,
            user: null,
            token: null,
          });
        }
      },

      // Check authentication status
      checkAuth: async () => {
        try {
          set({ isLoading: true });

          const { token, user } = await apiService.getStoredAuth();

          if (token && user) {
            // Verify token is still valid with backend
            const isValid = await apiService.healthCheck();

            if (isValid) {
              set({
                isAuthenticated: true,
                user,
                token,
                isLoading: false,
              });
            } else {
              // Token expired, try to logout
              await get().logout();
              set({ isLoading: false });
            }
          } else {
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Check auth error:', error);
          set({ isLoading: false });
        }
      },

      // Refresh token
      refreshToken: async () => {
        try {
          // In production, implement token refresh
          // For now, just verify current token
          const isValid = await apiService.healthCheck();
          return isValid;
        } catch (error) {
          console.error('Token refresh error:', error);
          return false;
        }
      },

      // Update user data
      updateUser: (updates: Partial<any>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;
