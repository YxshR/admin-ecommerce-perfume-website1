import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perfume Combo Sets | Avito Scent',
  description: 'Explore our curated perfume combo sets that offer great value and variety for every occasion.',
};

export default function PerfumeComboSetsPage() {
  return (
    <ProductListing 
      category="perfumes"
      subCategory="combo"
      title="Perfume Combo Sets"
      description="Explore our curated perfume combo sets that offer great value and variety for every occasion."
    />
  );
} 