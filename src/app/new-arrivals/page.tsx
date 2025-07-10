'use server';

import ProductListing from '../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Arrivals | Avito Scent',
  description: 'Discover our latest fragrance creations and be the first to experience our newest scents.',
};

export default function NewArrivalsPage() {
  return (
    <ProductListing 
      tag="new-arrival"
      title="New Arrivals"
      description="Discover our latest fragrance creations and be the first to experience our newest scents."
    />
  );
} 