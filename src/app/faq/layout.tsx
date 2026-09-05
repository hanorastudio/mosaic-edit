import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Mosaic FAQ & Knowledgebase | Aura Mosaic Studio',
  description:
    'Frequently asked questions about Aura Mosaic Studio. Learn about free online photo mosaic creation, CIE-LAB Delta E color matching, 100% private local processing, and 300 DPI print PDF export.',
  alternates: {
    canonical: 'https://mosaic.hanorastudio.in/faq',
  },
  openGraph: {
    title: 'Photo Mosaic FAQ & Knowledgebase | Aura Mosaic Studio',
    description:
      'Everything you need to know about creating professional photo mosaics with Aura Mosaic Studio with zero watermarks.',
    url: 'https://mosaic.hanorastudio.in/faq',
    siteName: 'Aura Mosaic Studio',
    locale: 'en_US',
    type: 'website',
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
