import ProductListing from '../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aesthetic Attars Collection | Avito Scent',
  description: 'Discover our collection of traditional and modern aesthetic attars crafted with natural ingredients.',
};

export default async function AestheticAttarsPage() {
  return (
    <ProductListing 
      category="aesthetic-attars"
      title="Aesthetic Attars Collection"
      description="Discover our collection of traditional and modern aesthetic attars crafted with natural ingredients."
    />
  );
} 