import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Aura Mosaic Studio',
  description:
    'Terms of service and usage guidelines for Aura Mosaic Studio photo mosaic creator.',
  alternates: {
    canonical: 'https://mosaic.hanorastudio.in/terms',
  },
  openGraph: {
    title: 'Terms of Service | Aura Mosaic Studio',
    description: 'Terms of service and usage guidelines for Aura Mosaic Studio.',
    url: 'https://mosaic.hanorastudio.in/terms',
    siteName: 'Aura Mosaic Studio',
    locale: 'en_US',
    type: 'website',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
