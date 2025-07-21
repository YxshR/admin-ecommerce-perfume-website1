export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateStaticParams() {
  // In a real application, you might fetch a list of order IDs here
  return [];
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  // This ensures Next.js knows this is a server component
  return (
    <div className="w-full min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="max-w-4xl w-full bg-white shadow-md rounded-lg p-8">
        <p className="text-lg text-center">
          Loading order details for ID: {params.id}
        </p>
        <p className="text-center mt-4">
          <a href={`/admin/orders/view/${params.id}`} className="text-blue-600 hover:underline">
            Go to order details
          </a>
        </p>
      </div>
    </div>
  );
} 