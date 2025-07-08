'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiCheck, FiLoader, FiPackage, FiTruck } from 'react-icons/fi';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface GuestOrder {
  _id: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: OrderItem[];
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  paymentMethod: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('id');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<GuestOrder | null>(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order ID not found');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch order details
        const response = await fetch(`/api/guest-orders?id=${orderId}`, {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        
        if (!data.success || !data.order) {
          throw new Error('Order not found');
        }
        
        setOrder(data.order);
        
        // Clear cart after successful order
        localStorage.removeItem('cart');
        localStorage.setItem('cart_updated', Date.now().toString());
        
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin h-12 w-12 text-black mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'We couldn\'t find the order you\'re looking for.'}</p>
          <Link href="/" className="inline-block bg-black text-white px-6 py-3 rounded-md">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {/* Order confirmation header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FiCheck className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Order Confirmed!</h1>
            <p className="text-gray-600 mt-2">
              Thank you for your order, {order.customerInfo.name}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Order #{order._id.substring(order._id.length - 8)}
            </p>
          </div>
          
          {/* Order details */}
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Order Details</h2>
            
            <div className="space-y-6">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                    <Image
                      src={item.image || '/perfume-placeholder.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <h3 className="text-base font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium mt-1">₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order summary */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{order.itemsPrice.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{order.shippingPrice > 0 ? `₹${order.shippingPrice.toFixed(2)}` : 'Free'}</span>
              </div>
              
              <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>₹{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Shipping information */}
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">Shipping Information</h2>
            
            <div className="bg-gray-50 rounded-md p-4">
              <p className="font-medium">{order.customerInfo.name}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2">Phone: {order.customerInfo.phone}</p>
              <p>Email: {order.customerInfo.email}</p>
            </div>
          </div>
          
          {/* Shipping status */}
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Shipping Status</h2>
            
            <div className="relative">
              <div className="absolute left-8 top-0 h-full w-1 bg-gray-200"></div>
              
              <div className="relative flex items-center mb-8">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center z-10">
                  <FiCheck className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Order Confirmed</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-center mb-8">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center z-10">
                  <FiPackage className="w-8 h-8 text-gray-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-500">Processing</h3>
                  <p className="text-sm text-gray-500">Your order is being prepared</p>
                </div>
              </div>
              
              <div className="relative flex items-center">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center z-10">
                  <FiTruck className="w-8 h-8 text-gray-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-500">Shipping</h3>
                  <p className="text-sm text-gray-500">Estimated delivery in 3-5 business days</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
            <Link href="/" className="bg-black text-white py-3 px-6 rounded-md text-center hover:bg-gray-800">
              Continue Shopping
            </Link>
            <Link href={`/track-order?id=${order._id}`} className="border border-gray-300 py-3 px-6 rounded-md text-center hover:bg-gray-50">
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 