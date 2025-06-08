'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiX, FiPlus, FiMinus } from 'react-icons/fi';
import { useAuth } from './AuthProvider';
import { useCart, CartService } from '@/app/services/CartService';
import CheckoutModal from './CheckoutModal';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCartWithModal({ isOpen, onClose }: MiniCartProps) {
  const { items: cartItems, total: subtotal, loading, updateQuantity, removeItem } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  // Handle click outside of cart panel to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Sync cart with server when cart is opened for authenticated users
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      CartService.syncWithServer(true);
    }
  }, [isOpen, isAuthenticated]);

  // Apply discount code
  const applyDiscount = () => {
    // This would typically connect to an API to validate the code
    console.log('Applying discount code:', discountCode);
    // For now, just clear the input
    setDiscountCode('');
  };

  // Handle checkout button click
  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login for non-authenticated users
      window.location.href = '/login?redirect=/checkout';
    } else {
      // Close mini cart and open checkout modal
      onClose();
      setIsCheckoutModalOpen(true);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      )}
      
      {/* Cart panel */}
      <div 
        ref={cartRef}
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-4 border-b">
          <h2 className="text-xl font-medium">Your Cart</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-black"
            aria-label="Close cart"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Cart content */}
        <div className="h-[calc(100%-190px)] overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Link
                href="/store"
                className="px-4 py-2 bg-black text-white hover:bg-gray-800"
                onClick={onClose}
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {cartItems.map((item) => (
                <li key={item.id} className="py-4">
                  <div className="flex items-start">
                    {/* Product image */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product details */}
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <FiX size={18} />
                        </button>
                      </div>
                      
                      {/* Quantity controls */}
                      <div className="mt-2 flex items-center">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="text-gray-500 p-1 border border-gray-300 rounded-md disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="mx-2 text-gray-700 w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-500 p-1 border border-gray-300 rounded-md"
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Footer with checkout button */}
        <div className="absolute bottom-0 left-0 right-0 border-t px-4 py-4 bg-white">
          {/* Discount code input */}
          <div className="flex mb-4">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Discount code"
              className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
              onClick={applyDiscount}
              className="ml-2 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Apply
            </button>
          </div>
          
          {/* Subtotal and checkout */}
          <div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="w-full py-3 px-4 bg-black text-white font-medium hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Checkout
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        </div>
      </div>
      
      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)} 
        cartItems={cartItems}
        subtotal={subtotal}
      />
    </>
  );
} 