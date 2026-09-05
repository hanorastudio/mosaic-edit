import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy & 100% Local Processing Guarantee | Aura Mosaic Studio',
  description:
    'Aura Mosaic Studio privacy policy. All photos remain 100% private on your device with client-side HTML5 Canvas processing and zero cloud uploads.',
  alternates: {
    canonical: 'https://mosaic.hanorastudio.in/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Aura Mosaic Studio',
    description: '100% on-device private local processing guarantee.',
    url: 'https://mosaic.hanorastudio.in/privacy',
    siteName: 'Aura Mosaic Studio',
    locale: 'en_US',
    type: 'website',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
