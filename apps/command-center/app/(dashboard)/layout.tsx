'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import CommandPalette from '@/components/CommandPalette';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<'jigawa' | 'kano'>('jigawa');

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <Topbar
            currentTenant={currentTenant}
            onTenantChange={setCurrentTenant}
          />
          <main className="flex-1 overflow-y-auto bg-uradi-bg-primary">
            {children}
          </main>
        </div>
      </div>
      <CommandPalette />
    </QueryClientProvider>
  );
}
