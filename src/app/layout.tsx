import type { Metadata } from 'next';
import {
  Plus_Jakarta_Sans,
  Playfair_Display,
  Cinzel,
  Cormorant_Garamond,
  Montserrat,
} from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700', '800'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600', '700'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mosaic.hanorastudio.in'),
  title: {
    default: 'Aura Mosaic Studio — Free Online Photo Mosaic Maker & Generator',
    template: '%s | Aura Mosaic Studio',
  },
  description:
    'Best free online photo mosaic maker. Turn hundreds of photos into a stunning custom photo mosaic, heart art, name art, or wall poster automatically with zero watermark, 4K/8K resolution, and 100% private client-side processing.',
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
    canonical: 'https://mosaic.hanorastudio.in',
  },
  openGraph: {
    title: 'Aura Mosaic Studio — Free Online Photo Mosaic Maker & Generator',
    description:
      'Turn hundreds of photos into a stunning custom photo mosaic, heart art, name art, or wall poster. 100% private, 4K/8K resolution, and zero watermarks.',
    type: 'website',
    url: 'https://mosaic.hanorastudio.in',
    siteName: 'Aura Mosaic Studio',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aura Mosaic Studio — Free Online Photo Mosaic Maker & Generator',
    description:
      'Turn hundreds of photos into a custom photo mosaic art in seconds. Zero watermark, 4K/8K export, 100% private browser processing.',
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

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://mosaic.hanorastudio.in/#webapp',
      name: 'Aura Mosaic Studio — Free Online Photo Mosaic Maker',
      url: 'https://mosaic.hanorastudio.in',
      description:
        'Free online browser-based photo mosaic maker and generator. Automatically create photo mosaics from your own pictures with zero watermark, 4K/8K resolution, and CIE-LAB color matching.',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'All (Web, Windows 10/11, macOS, iOS, Android)',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      creator: {
        '@type': 'Organization',
        name: 'Hanora Studio',
        url: 'https://www.hanorastudio.in/',
      },
      featureList: [
        'Free Online Photo Mosaic Maker with No Watermark',
        'CIE-LAB Delta E Intelligent Color Matching',
        'Irregular Masonry Grid (6x6, 6x3, 4x4, 4x2, 2x2, 2x1, 1x1)',
        'Custom Portrait & Picture Target Processing',
        'Ultra High Resolution 4K / 8K & 300 DPI Print PDF Export',
        'Cinematic 4K MP4 Video to Mosaic Animation',
        '100% Private Client-Side Browser Processing (Zero Cloud Uploads)',
      ],
    },
    {
      '@type': 'Organization',
      '@id': 'https://mosaic.hanorastudio.in/#organization',
      name: 'Aura Mosaic Studio',
      url: 'https://mosaic.hanorastudio.in',
      logo: 'https://mosaic.hanorastudio.in/favicon.ico',
      parentOrganization: {
        '@type': 'Organization',
        name: 'Hanora Studio',
        url: 'https://www.hanorastudio.in/',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${playfair.variable} ${cinzel.variable} ${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#141414] text-[#FAF8F5] selection:bg-[#C8A96B] selection:text-[#141414]">
        {children}
      </body>
    </html>
  );
}
