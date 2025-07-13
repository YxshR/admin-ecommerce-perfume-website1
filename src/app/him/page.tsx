import ProductListing from '../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perfumes for Him | Avito Scent',
  description: 'Explore our exclusive collection of premium fragrances for men. Find the perfect scent for every occasion.',
};

export default async function HimPage() {
  return (
    <ProductListing 
      gender="Male"
      title="Fragrances for Him"
      description="Discover our exclusive collection of premium fragrances crafted specifically for men. From bold and masculine to subtle and sophisticated."
    />
  );
} 