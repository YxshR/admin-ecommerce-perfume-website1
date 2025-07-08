import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luxury Perfumes | Avito Scent',
  description: 'Indulge in our exclusive collection of luxury perfumes designed for those who appreciate the finest fragrances.',
};

export default function LuxuryPerfumesPage() {
  return (
    <ProductListing 
      category="perfumes"
      subCategory="luxury"
      title="Luxury Perfumes"
      description="Indulge in our exclusive collection of luxury perfumes designed for those who appreciate the finest fragrances."
    />
  );
} 