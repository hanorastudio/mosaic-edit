import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Birthday & Milestone Number Photo Mosaics | Aura Mosaic Studio',
  description:
    'Create personalized milestone number mosaics (1, 18, 21, 25, 50) compiling hundreds of birthday and anniversary celebration memories.',
  alternates: {
    canonical: 'https://mosaic.hanorastudio.in/birthday-albums',
  },
  openGraph: {
    title: 'Birthday & Milestone Number Photo Mosaics | Aura Mosaic Studio',
    description:
      'Compile hundreds of birthday celebration memories into milestone numbers and shapes.',
    url: 'https://mosaic.hanorastudio.in/birthday-albums',
    siteName: 'Aura Mosaic Studio',
    locale: 'en_US',
    type: 'website',
  },
};

export default function BirthdayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
