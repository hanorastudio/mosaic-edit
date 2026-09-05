import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wedding Photo Mosaic Creator — Turn Couple Pictures into Mosaic Art | Aura Mosaic Studio',
  description:
    'Stitch 500+ candid photos from your wedding ceremony, pre-wedding shoot, and reception into one iconic couple portrait or heart mosaic with zero watermark and 300 DPI print PDF export.',
  alternates: {
    canonical: 'https://mosaic.hanorastudio.in/wedding-albums',
  },
  openGraph: {
    title: 'Wedding Photo Mosaic Creator | Aura Mosaic Studio',
    description:
      'Transform hundreds of wedding memories into one high-resolution photo mosaic artwork.',
    url: 'https://mosaic.hanorastudio.in/wedding-albums',
    siteName: 'Aura Mosaic Studio',
    locale: 'en_US',
    type: 'website',
  },
};

export default function WeddingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
