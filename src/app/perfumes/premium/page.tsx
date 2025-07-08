import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium Perfumes | Avito Scent',
  description: 'Explore our collection of premium perfumes crafted with the finest ingredients for a lasting impression.',
};

export default function PremiumPerfumesPage() {
  return (
    <ProductListing 
      category="perfumes"
      subCategory="premium"
      title="Premium Perfumes"
      description="Explore our collection of premium perfumes crafted with the finest ingredients for a lasting impression."
    />
  );
} 