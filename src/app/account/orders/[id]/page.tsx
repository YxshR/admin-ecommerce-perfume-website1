'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthProvider';
import Link from 'next/link';
import { FiDownload, FiPrinter } from 'react-icons/fi';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderDetails {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  trackingId?: string;
}

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const orderId = params.id as string;

  useEffect(() => {
      // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login?redirect=/account/orders');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/orders/${orderId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        
        // Process the order data to ensure all fields are normalized
        if (data.order) {
          // Ensure items array exists (use items, orderItems, or create an empty array)
          data.order.items = data.order.items || data.order.orderItems || [];
          
          // Calculate total if missing
          if (!data.order.total || data.order.total === 0) {
            // Calculate from items
            const itemsTotal = data.order.items.reduce(
              (sum: number, item: any) => sum + (item.price * item.quantity), 
              0
            );
            const shippingPrice = data.order.shippingPrice || 0;
            data.order.total = itemsTotal + shippingPrice;
          }
          
          // Ensure each item has product ID
          data.order.items = data.order.items.map((item: any) => ({
            ...item,
            productId: item.id || item.product || 'unknown',
          }));
        }
        
        setOrder(data.order);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && orderId) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, orderId, router]);
  
  // Function to download invoice (only for delivered orders)
  const downloadInvoice = async () => {
    if (!order || order.status !== 'Delivered') {
      alert('Invoice is only available for delivered orders');
      return;
    }
    
    try {
      setGeneratingInvoice(true);
      const response = await fetch(`/api/orders/${order.id}/invoice`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.invoice) {
        throw new Error(data.error || 'Failed to generate invoice');
      }
      
      // Create a simple invoice HTML
      const invoiceHtml = generateInvoiceHtml(data.invoice);
      
      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      } else {
        alert('Please allow pop-ups to view the invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again later.');
    } finally {
      setGeneratingInvoice(false);
    }
  };
  
  // Generate simple invoice HTML
  const generateInvoiceHtml = (invoice: any) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
            .invoice-header { text-align: center; margin-bottom: 30px; }
            .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .invoice-number { font-size: 16px; color: #666; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
            .table th { background-color: #f9f9f9; }
            .total-section { margin-top: 20px; border-top: 2px solid #eee; padding-top: 10px; }
            .total-row { font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">${invoice.invoiceNumber}</div>
            <div>Order ID: ${invoice.orderId}</div>
            <div>Date: ${new Date(invoice.date).toLocaleDateString()}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Customer Information</div>
            <div>${invoice.customer.name}</div>
            <div>${invoice.customer.email}</div>
            <div>${invoice.customer.phone}</div>
            <div>${invoice.customer.address.line1}</div>
            <div>${invoice.customer.address.city}, ${invoice.customer.address.state} ${invoice.customer.address.postalCode}</div>
            <div>${invoice.customer.address.country}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Items</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map((item: any) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>₹${item.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="total-section">
            <div class="row">
              <span>Subtotal:</span>
              <span>₹${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div class="row">
              <span>Shipping:</span>
              <span>₹${invoice.shipping.toFixed(2)}</span>
            </div>
            ${invoice.tax > 0 ? `
            <div class="row">
              <span>Tax:</span>
              <span>₹${invoice.tax.toFixed(2)}</span>
            </div>
            ` : ''}
            ${invoice.discount > 0 ? `
            <div class="row">
              <span>Discount:</span>
              <span>-₹${invoice.discount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="row total-row">
              <span>Total:</span>
              <span>₹${invoice.total.toFixed(2)}</span>
            </div>
            <div class="row">
              <span>Payment Method:</span>
              <span>${invoice.paymentMethod}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>A V I T O   S C E N T S</p>
          </div>
        </body>
      </html>
    `;
  };
  
  // Format date to more readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format price to currency
  const formatPrice = (price: number) => {
    return `₹${price.toFixed(2)}`;
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/account/orders" 
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to Orders
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : order ? (
          <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Order #{order.id}</h1>
                <p className="text-gray-600">Placed on {formatDate(order.date)}</p>
              </div>
              <div className="mt-2 md:mt-0 flex flex-col md:flex-row gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'Delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'Shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.status}
                </span>
                
                {/* Show invoice button only for delivered orders */}
                {order.status === 'Delivered' && (
                  <button
                    onClick={downloadInvoice}
                    disabled={generatingInvoice}
                    className="inline-flex items-center px-3 py-1 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-700"
                  >
                    {generatingInvoice ? (
                      <span className="inline-flex items-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <FiDownload className="mr-1" /> Invoice
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {order.trackingId && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-8">
                <p className="font-medium">Tracking Number: {order.trackingId}</p>
                <div className="mt-2">
                  <Link
                    href={`/track-order?id=${order.trackingId}`}
                    className="text-blue-700 font-medium hover:text-blue-900"
                  >
                    Track this order →
                  </Link>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Shipping Information */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-medium mb-4">Shipping Information</h2>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p className="mt-2">Phone: {order.shippingAddress.phone}</p>}
              </div>
              
              {/* Payment Information */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-medium mb-4">Payment Information</h2>
                <p><span className="font-medium">Method:</span> {order.paymentMethod}</p>
                <p className="mt-2"><span className="font-medium">Total:</span> {formatPrice(order.total)}</p>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="mb-8">
              <h2 className="text-xl font-medium mb-4">Order Items</h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.image && (
                              <div className="flex-shrink-0 h-10 w-10 mr-4">
                                <img 
                                  className="h-10 w-10 object-cover rounded" 
                                  src={item.image} 
                                  alt={item.name} 
                                />
                              </div>
                            )}
                            <div>
                              <Link 
                                href={`/product/${item.productId}`}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600"
                              >
                                {item.name}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatPrice(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link
              href="/account/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
            >
              Back to Orders
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 