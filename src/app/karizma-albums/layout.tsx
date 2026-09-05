import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Karizma Photo Mosaic Art & Album Collages | Aura Mosaic Studio',
  description:
    'Design royal Karizma style large-format photo mosaic collages for wedding photography albums and luxury photo books.',
  alternates: {
    canonical: 'https://mosaic.hanorastudio.in/karizma-albums',
  },
  openGraph: {
    title: 'Karizma Photo Mosaic Art | Aura Mosaic Studio',
    description:
      'Royal Karizma style photo mosaic layouts and photo books.',
    url: 'https://mosaic.hanorastudio.in/karizma-albums',
    siteName: 'Aura Mosaic Studio',
    locale: 'en_US',
    type: 'website',
  },
};

export default function KarizmaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
