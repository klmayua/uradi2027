import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mustapha Sule Lamido | Vision for Progress',
  description:
    'Join the movement for progress in Jigawa State. Mustapha Sule Lamido - Leadership for Tomorrow.',
  openGraph: {
    title: 'Mustapha Sule Lamido | Vision for Progress',
    description: 'Join the movement for progress in Jigawa State',
    type: 'website',
  },
};

export default function LamidoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-uradi-bg-primary">
      {children}
    </div>
  );
}
