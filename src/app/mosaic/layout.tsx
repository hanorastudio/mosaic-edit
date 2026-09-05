import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Photo Mosaic Maker Online — Turn Pictures into One Mosaic (No Watermark)',
  description:
    'Best free online photo mosaic maker & automatic generator. Turn multiple pictures into one big custom photo mosaic art in seconds with zero watermark, 4K/8K resolution, and 100% private browser-based processing for Mac, Windows, iPhone, & Android.',
  keywords: [
    'mosaic maker',
    'Online mosaic maker',
    'free photo mosaic maker',
    'free mosaic maker',
    'free mosaic maker online',
    'free mosaic maker software',
    'mosaic maker online free',
    'mosaic maker online',
    'mosaic photo online',
    'best free photo mosaic maker',
    'online mosaic photo generator free',
    'create photo mosaic online free no watermark',
    'browser-based photo mosaic creator',
    'free picture mosaic app',
    'easy mosaic maker online',
    'automatic photo mosaic generator',
    'free mosaic collage maker',
    'turn photo into mosaic online free',
    'photo mosaic software for Mac',
    'best mosaic maker for Windows 10/11',
    'mosaic picture app for iPhone/Android',
    'downloadable mosaic maker software',
    'professional photo mosaic software',
    'open-source photo mosaic maker',
    'offline mosaic generator',
    'high resolution photo mosaic maker',
    'square tile mosaic generator',
    'AI photo mosaic generator',
    'custom photo mosaic wall art',
    'video to mosaic maker',
    'hexagonal tile mosaic creator',
    'retro pixel art mosaic generator',
    'Polaroid mosaic maker',
    'how to make a photo mosaic online',
    'turn multiple pictures into one picture mosaic',
    'create a mosaic from my own photos',
    'how to generate a picture out of tiny pictures',
    'steps to create a mosaic collage',
    'easiest way to make a photo mosaic',
    'custom photo mosaic print',
    'personalized mosaic picture gift',
    'order photo mosaic poster',
    'photo mosaic canvas print online',
    'anniversary photo mosaic gift',
    'large scale photo mosaic printing',
    'wedding photo mosaic creator',
    'tesserae',
    'photo grid collage',
    'micro image collage',
    'pixelated photo effect',
    'tile grid picture',
    'image stitching software',
    'photo compilation art',
  ],
  authors: [
    { name: 'Aura Mosaic Studio' },
    { name: 'Hanora Studio', url: 'https://www.hanorastudio.in/' },
  ],
  creator: 'Hanora Studio',
  publisher: 'Aura Mosaic Studio',
  alternates: {
    canonical: 'https://mosaic.hanorastudio.in/mosaic',
  },
  openGraph: {
    title: 'Free Photo Mosaic Maker Online — Turn Pictures into One Mosaic Art (No Watermark)',
    description:
      'The #1 free online photo mosaic maker. Turn hundreds of photos into a stunning custom photo mosaic, heart art, name art, or wall poster. 100% private, 4K/8K resolution, and zero watermarks.',
    url: 'https://mosaic.hanorastudio.in/mosaic',
    siteName: 'Aura Mosaic Studio',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Photo Mosaic Maker — No Watermark, 4K Export',
    description:
      'Create high-resolution photo mosaics from your own pictures online. Turn hundreds of tiny photos into one big photo mosaic art automatically.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function MosaicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
