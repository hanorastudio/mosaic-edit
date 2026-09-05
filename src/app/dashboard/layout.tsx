import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Creations & Projects | Aura Mosaic Studio',
  description:
    'Manage, view, and export your custom photo mosaic projects, heart art, name art, and high-resolution photo mosaics.',
  alternates: {
    canonical: 'https://mosaic.hanorastudio.in/dashboard',
  },
  openGraph: {
    title: 'My Creations & Projects | Aura Mosaic Studio',
    description:
      'Manage and view all your custom photo mosaic projects with zero watermark and 4K/8K resolution.',
    url: 'https://mosaic.hanorastudio.in/dashboard',
    siteName: 'Aura Mosaic Studio',
    locale: 'en_US',
    type: 'website',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
