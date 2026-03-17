import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tenant {
  id: 'jigawa' | 'kano';
  name: string;
  state: string;
  lga_count: number;
  candidate_name: string;
  candidate_party: string;
  primary_color: string;
}

const tenants: Record<string, Tenant> = {
  jigawa: {
    id: 'jigawa',
    name: 'Jigawa',
    state: 'Jigawa State',
    lga_count: 27,
    candidate_name: 'Mustapha Lamido',
    candidate_party: 'PDP',
    primary_color: '#DC2626',
  },
  kano: {
    id: 'kano',
    name: 'Kano',
    state: 'Kano State',
    lga_count: 44,
    candidate_name: 'Ibrahim Khalil',
    candidate_party: 'NNPP',
    primary_color: '#7C3AED',
  },
};

interface TenantState {
  currentTenant: Tenant;
  availableTenants: Tenant[];

  // Actions
  setTenant: (tenantId: 'jigawa' | 'kano') => void;
  getTenantById: (tenantId: string) => Tenant | undefined;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set, get) => ({
      currentTenant: tenants.jigawa,
      availableTenants: Object.values(tenants),

      setTenant: (tenantId: 'jigawa' | 'kano') => {
        const tenant = tenants[tenantId];
        if (tenant) {
          set({ currentTenant: tenant });
        }
      },

      getTenantById: (tenantId: string) => {
        return tenants[tenantId];
      },
    }),
    {
      name: 'tenant-storage',
      partialize: (state) => ({
        currentTenant: state.currentTenant,
      }),
    }
  )
);

// Export tenants for use in other files
export { tenants };
