import ProductListing from '../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Selling Products | Avito Scent',
  description: 'Discover our most popular and best-selling fragrances loved by customers across India.',
};

export default function BestSellingPage() {
  return (
    <ProductListing 
      tag="best-seller"
      title="Best Selling Products"
      description="Discover our most popular and best-selling fragrances loved by customers across India."
    />
  );
} 