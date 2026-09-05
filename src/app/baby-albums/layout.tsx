import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Baby & Kids Photo Mosaic Art Creator | Aura Mosaic Studio',
  description:
    'Turn monthly milestone baby photos into cute heart, teddy, and star photo mosaics with deep zoom.',
  alternates: {
    canonical: 'https://mosaic.hanorastudio.in/baby-albums',
  },
  openGraph: {
    title: 'Baby & Kids Photo Mosaic Art Creator | Aura Mosaic Studio',
    description:
      'Turn milestone baby pictures into cute heart, teddy, and star photo mosaics.',
    url: 'https://mosaic.hanorastudio.in/baby-albums',
    siteName: 'Aura Mosaic Studio',
    locale: 'en_US',
    type: 'website',
  },
};

export default function BabyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
