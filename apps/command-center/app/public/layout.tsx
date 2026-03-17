import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alhaji Musa Danladi | Leadership That Delivers for Jigawa',
  description: 'Join the movement for progress, transparency, and prosperity in Jigawa State. Together, we build a brighter future.',
  openGraph: {
    title: 'Alhaji Musa Danladi | Leadership That Delivers',
    description: 'Join the movement for progress in Jigawa State',
    type: 'website',
  },
};

export default function PublicLayout({
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
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
