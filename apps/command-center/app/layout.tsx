import type { Metadata } from 'next';
import './globals.css';
import { QueryClientProvider } from '@/components/providers/QueryClientProvider';

export const metadata: Metadata = {
  title: 'URADI-360 Command Center',
  description: 'Political intelligence and campaign management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-uradi-bg-primary text-uradi-text-primary font-sans antialiased">
        <QueryClientProvider>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
