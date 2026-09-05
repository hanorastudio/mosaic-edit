import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aura Mosaic Studio — Free Online Photo Mosaic Maker & Generator',
    short_name: 'Mosaic Maker',
    description:
      'Free online photo mosaic generator. Turn hundreds of pictures into one big photo mosaic art with zero watermark, 4K/8K resolution, and 100% private client-side processing.',
    start_url: '/mosaic',
    display: 'standalone',
    background_color: '#0C0C0E',
    theme_color: '#C8A96B',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    categories: ['photo', 'graphics', 'utilities', 'productivity', 'design'],
  };
}
