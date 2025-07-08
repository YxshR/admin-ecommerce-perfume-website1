import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luxury Car Diffusers | Avito Scent',
  description: 'Elevate your driving experience with our luxury car diffusers that provide a premium fragrance experience on the go.',
};

export default function LuxuryCarDiffusersPage() {
  return (
    <ProductListing 
      category="air-fresheners"
      subCategory="car"
      title="Luxury Car Diffusers"
      description="Elevate your driving experience with our luxury car diffusers that provide a premium fragrance experience on the go."
    />
  );
} 