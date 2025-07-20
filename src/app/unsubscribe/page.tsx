'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiGift, FiTag, FiPercent, FiBell } from 'react-icons/fi';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resubscribed'>('loading');
  const [message, setMessage] = useState('Processing your unsubscribe request...');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const emailParam = searchParams?.get('email');
    
    if (!emailParam) {
      setStatus('error');
      setMessage('No email provided. Please check the link and try again.');
      return;
    }

    setEmail(emailParam);
    setShowConfirmation(true);
  }, [searchParams]);

  const handleUnsubscribe = async () => {
    try {
      setStatus('loading');
      setMessage('Processing your unsubscribe request...');
      setShowConfirmation(false);
      
      const response = await fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}`);
      
      if (response.ok) {
        setStatus('success');
        setMessage('You have been successfully unsubscribed from our product notifications.');
      } else {
        const data = await response.json();
        setStatus('error');
        setMessage(data.message || 'Failed to unsubscribe. Please try again later.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while processing your request. Please try again later.');
    }
  };

  const handleResubscribe = async () => {
    try {
      setStatus('loading');
      setMessage('Processing your resubscribe request...');
      
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setStatus('resubscribed');
        setMessage('You have been successfully resubscribed to our product notifications.');
      } else {
        const data = await response.json();
        setStatus('error');
        setMessage(data.message || 'Failed to resubscribe. Please try again later.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while processing your request. Please try again later.');
    }
  };

  const benefits = [
    {
      icon: <FiTag className="h-8 w-8 text-[#c19b6c]" />,
      title: 'Exclusive Coupon Codes',
      description: 'Get access to subscriber-only discount codes and special offers.'
    },
    {
      icon: <FiGift className="h-8 w-8 text-[#c19b6c]" />,
      title: 'Limited Edition Products',
      description: 'Be the first to know about our limited edition and exclusive fragrances.'
    },
    {
      icon: <FiPercent className="h-8 w-8 text-[#c19b6c]" />,
      title: 'Early Access to Sales',
      description: "Shop our sales before they're available to the general public."
    },
    {
      icon: <FiBell className="h-8 w-8 text-[#c19b6c]" />,
      title: 'New Product Alerts',
      description: 'Never miss a new release with instant notifications.'
    }
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-md">
        {showConfirmation ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-center">Unsubscribe Confirmation</h1>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to unsubscribe <span className="font-medium">{email}</span> from our product notifications?
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={handleUnsubscribe}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Yes, Unsubscribe Me
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                No, Keep Me Subscribed
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4 text-center">
              {status === 'loading' ? 'Processing' : 
               status === 'success' ? 'Unsubscribed' : 
               status === 'resubscribed' ? 'Resubscribed' : 'Error'}
            </h1>
            
            <div className={`mb-6 text-center ${
              status === 'loading' ? 'text-gray-600' : 
              status === 'success' ? 'text-red-600' : 
              status === 'resubscribed' ? 'text-green-600' : 'text-red-600'
            }`}>
              {status === 'loading' && (
                <div className="flex justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                </div>
              )}
              <p>{message}</p>
            </div>
            
            {status === 'success' && (
              <div className="text-center mb-8">
                <button 
                  onClick={handleResubscribe}
                  className="px-6 py-2 bg-[#c19b6c] text-white rounded hover:bg-[#a88a5c] transition-colors"
                >
                  Resubscribe
                </button>
              </div>
            )}
          </>
        )}

        {/* Benefits Section - Show when unsubscribed or showing confirmation */}
        {(status === 'success' || showConfirmation) && (
          <div className="mt-8 border-t pt-8">
            <h2 className="text-xl font-bold mb-6 text-center">Benefits You'll Miss Out On</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">{benefit.icon}</div>
                  <div>
                    <h3 className="font-medium text-lg">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-block px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
} 