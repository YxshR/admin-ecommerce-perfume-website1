'use client';

// Import the client component we created earlier
import OrderDetailClient from '../../[id]/client';

export default function OrderViewPage({ params }: { params: { id: string } }) {
  return <OrderDetailClient params={params} />;
} 