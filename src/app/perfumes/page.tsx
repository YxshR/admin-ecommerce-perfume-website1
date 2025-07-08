import ProductListing from '../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perfumes Collection | Avito Scent',
  description: 'Explore our exclusive collection of premium and luxury perfumes for every occasion.',
};

export default async function PerfumesPage() {
  return (
    <ProductListing 
      category="perfumes"
      title="Perfumes Collection"
      description="Explore our exclusive collection of premium and luxury perfumes for every occasion."
    />
  );
} 