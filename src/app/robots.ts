import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/mosaic/editor/', '/editor/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/mosaic/editor/', '/editor/'],
      },
      {
        userAgent: 'bingbot',
        allow: '/',
        disallow: ['/api/', '/mosaic/editor/', '/editor/'],
      },
    ],
    sitemap: 'https://mosaic.hanorastudio.in/sitemap.xml',
    host: 'https://mosaic.hanorastudio.in',
  };
}
