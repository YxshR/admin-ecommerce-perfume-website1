import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s - Avito Scent',
    default: 'Avito Scent | Premium Perfumes & Fragrances'
  },
  description: 'Discover premium perfumes and fragrances at Avito Scent. Find luxury scents for every occasion.',
  keywords: ['perfume', 'fragrance', 'luxury scents', 'Avito Scent'],
  authors: [
    { name: 'Avito Scent Team' }
  ],
  openGraph: {
    title: 'Avito Scent | Premium Perfumes & Fragrances',
    description: 'Discover premium perfumes and fragrances at Avito Scent. Find luxury scents for every occasion.',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'Avito Scent Logo'
      }
    ],
    type: 'website'
  }
} 