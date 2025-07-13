import ProductListing from '../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perfumes for Her | Avito Scent',
  description: 'Explore our exclusive collection of premium fragrances for women. Find the perfect scent for every occasion.',
};

export default async function HerPage() {
  return (
    <ProductListing 
      gender="Female"
      title="Fragrances for Her"
      description="Discover our exclusive collection of premium fragrances crafted specifically for women. From floral and fresh to warm and sensual."
    />
  );
} 