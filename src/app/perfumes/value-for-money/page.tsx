import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Value for Money Perfumes | Avito Scent',
  description: 'Discover our affordable yet high-quality perfumes that offer excellent value for money.',
};

export default function ValueForMoneyPerfumesPage() {
  return (
    <ProductListing 
      category="perfumes"
      subCategory="value-for-money"
      title="Value for Money Perfumes"
      description="Discover our affordable yet high-quality perfumes that offer excellent value for money."
    />
  );
} 