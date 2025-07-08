import ProductListing from '../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Waxfume (Solid) Collection | Avito Scent',
  description: 'Explore our innovative solid waxfume collection that provides long-lasting fragrance with elegant presentation.',
};

export default function WaxfumePage() {
  return (
    <ProductListing 
      category="waxfume"
      title="Waxfume (Solid) Collection"
      description="Explore our innovative solid waxfume collection that provides long-lasting fragrance with elegant presentation."
    />
  );
} 