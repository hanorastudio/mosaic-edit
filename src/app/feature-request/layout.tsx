import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feature Requests & Issue Support | Aura Mosaic Studio',
  description:
    'Submit ideas, feature requests, or report bugs directly to the Aura Mosaic Studio engineering team at Hanora Studio.',
  alternates: {
    canonical: 'https://mosaic.hanorastudio.in/feature-request',
  },
  openGraph: {
    title: 'Feature Requests & Issue Support | Aura Mosaic Studio',
    description:
      'Direct feedback, feature requests, and issue center for Aura Mosaic Studio.',
    url: 'https://mosaic.hanorastudio.in/feature-request',
    siteName: 'Aura Mosaic Studio',
    locale: 'en_US',
    type: 'website',
  },
};

export default function FeatureRequestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
