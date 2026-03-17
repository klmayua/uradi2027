import { create } from 'zustand';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;

  // Command Palette
  commandPaletteOpen: boolean;

  // Notifications
  notificationPanelOpen: boolean;
  unreadNotifications: number;

  // Modals/Drawers
  activeModal: string | null;
  activeDrawer: string | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleNotificationPanel: () => void;
  setNotificationPanelOpen: (open: boolean) => void;
  setUnreadNotifications: (count: number) => void;
  incrementUnreadNotifications: () => void;
  clearUnreadNotifications: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  openDrawer: (drawerId: string) => void;
  closeDrawer: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  notificationPanelOpen: false,
  unreadNotifications: 3,
  activeModal: null,
  activeDrawer: null,

  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
  },

  toggleCommandPalette: () => {
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen }));
  },

  setCommandPaletteOpen: (open: boolean) => {
    set({ commandPaletteOpen: open });
  },

  toggleNotificationPanel: () => {
    set((state) => ({ notificationPanelOpen: !state.notificationPanelOpen }));
  },

  setNotificationPanelOpen: (open: boolean) => {
    set({ notificationPanelOpen: open });
  },

  setUnreadNotifications: (count: number) => {
    set({ unreadNotifications: count });
  },

  incrementUnreadNotifications: () => {
    set((state) => ({ unreadNotifications: state.unreadNotifications + 1 }));
  },

  clearUnreadNotifications: () => {
    set({ unreadNotifications: 0 });
  },

  openModal: (modalId: string) => {
    set({ activeModal: modalId });
  },

  closeModal: () => {
    set({ activeModal: null });
  },

  openDrawer: (drawerId: string) => {
    set({ activeDrawer: drawerId });
  },

  closeDrawer: () => {
    set({ activeDrawer: null });
  },
}));
