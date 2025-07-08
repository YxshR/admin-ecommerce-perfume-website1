import ProductListing from '../../components/ProductListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Room Air Fresheners | Avito Scent',
  description: 'Transform your living spaces with our premium room air fresheners that create a welcoming and refreshing atmosphere.',
};

export default function RoomAirFreshenersPage() {
  return (
    <ProductListing 
      category="air-fresheners"
      subCategory="room"
      title="Room Air Fresheners"
      description="Transform your living spaces with our premium room air fresheners that create a welcoming and refreshing atmosphere."
    />
  );
} 