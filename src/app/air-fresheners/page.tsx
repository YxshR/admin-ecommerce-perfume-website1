import ProductListing from '../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Air Fresheners Collection | Avito Scent',
  description: 'Discover our collection of premium air fresheners for your home and car, designed to create a welcoming atmosphere.',
};

export default async function AirFreshenersPage() {
  return (
    <ProductListing 
      productType="Air Fresheners"
      title="Air Fresheners Collection"
      description="Discover our collection of premium air fresheners for your home and car, designed to create a welcoming atmosphere."
    />
  );
} 