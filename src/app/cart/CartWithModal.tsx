'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiTrash2, FiShoppingBag, FiPlus, FiMinus } from 'react-icons/fi';
import GuestCheckoutModal from '../components/GuestCheckoutModal';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function CartWithModal() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Fetch cart items from localStorage
  const fetchCart = async () => {
    try {
      setLoading(true);
      
      // Get cart from localStorage
      const savedCart = localStorage.getItem('cart') || '[]';
      let parsedCart = [];
      
      try {
        parsedCart = JSON.parse(savedCart);
        if (!Array.isArray(parsedCart)) {
          console.error('Cart data is not an array:', parsedCart);
          parsedCart = [];
        }
      } catch (parseError) {
        console.error('Error parsing cart data:', parseError);
        parsedCart = [];
      }
      
      setCartItems(parsedCart);
      
      // Calculate subtotal
      const total = parsedCart.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
      setSubtotal(total);
      
    } catch (error) {
      console.error('Error in fetchCart:', error);
      setCartItems([]);
      setSubtotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial cart fetch
    fetchCart();
    
    // Add event listener for storage events (when cart is updated in another tab or component)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cart' || event.key === 'cart_updated' || event.key === null) {
        console.log('Storage event detected, refreshing cart');
        fetchCart();
      }
    };
    
    // Add event listener for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for direct localStorage changes
    let lastCartUpdate = localStorage.getItem('cart_updated');
    
    const checkCartUpdates = setInterval(() => {
      const currentCartUpdate = localStorage.getItem('cart_updated');
      if (currentCartUpdate !== lastCartUpdate) {
        console.log('Cart update detected via timestamp');
        lastCartUpdate = currentCartUpdate;
        fetchCart();
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkCartUpdates);
    };
  }, []);

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      // Update localStorage cart
      updateLocalStorageCart(id, newQuantity);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };
  
  // Helper function to update localStorage cart
  const updateLocalStorageCart = (id: string, newQuantity: number) => {
    try {
      const savedCart = localStorage.getItem('cart') || '[]';
      let cart = JSON.parse(savedCart);
      
      if (!Array.isArray(cart)) {
        console.error('Cart is not an array');
        cart = [];
      }
      
      const updatedItems = cart.map((item: any) => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      
      // Update state
      setCartItems(updatedItems);
      
      // Recalculate subtotal
      const total = updatedItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
      setSubtotal(total);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      // Trigger storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(updatedItems),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('Error updating localStorage cart:', error);
    }
  };

  const removeItem = async (id: string) => {
    try {
      // Remove item from localStorage
      removeLocalStorageItem(id);
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };
  
  // Helper function to remove item from localStorage
  const removeLocalStorageItem = (id: string) => {
    try {
      const savedCart = localStorage.getItem('cart') || '[]';
      let cart = JSON.parse(savedCart);
      
      if (!Array.isArray(cart)) {
        console.error('Cart is not an array');
        cart = [];
      }
      
      const updatedItems = cart.filter((item: any) => item.id !== id);
      
      // Update state
      setCartItems(updatedItems);
      
      // Recalculate subtotal
      const total = updatedItems.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
      setSubtotal(total);
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      // Update timestamp to trigger events in other components
      localStorage.setItem('cart_updated', Date.now().toString());
      
      // Trigger storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(updatedItems),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('Error removing item from localStorage cart:', error);
    }
  };
  
  const openCheckoutModal = () => {
    setIsCheckoutModalOpen(true);
  };
  
  const closeCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Shopping Cart</h1>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-gray-500">
              Looks like you haven't added any perfumes to your cart yet.
            </p>
            <div className="mt-6">
              <Link href="/store" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8">
              <div className="border-t border-b border-gray-200 divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-6 flex">
                    <div className="flex-shrink-0 w-24 h-24 relative">
                      <Image
                        src={item.image || '/perfume-placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    
                    <div className="ml-6 flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium">
                          <Link href={`/product/${item.id}`} className="text-black hover:text-gray-800">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-lg font-medium">₹{item.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="mt-auto flex justify-between items-center">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className={`p-2 ${
                              item.quantity <= 1 ? 'text-gray-300' : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            <FiMinus size={16} />
                          </button>
                          <span className="px-4">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-gray-600 hover:text-gray-800"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 flex items-center"
                        >
                          <FiTrash2 size={18} className="mr-1" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 lg:mt-0 lg:col-span-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-medium">₹{subtotal.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex justify-between">
                    <p className="text-gray-600">Shipping</p>
                    <p className="font-medium">{subtotal >= 500 ? 'Free' : '₹70.00'}</p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <p className="text-lg font-medium">Total</p>
                    <p className="text-lg font-medium">₹{(subtotal + (subtotal >= 500 ? 0 : 70)).toFixed(2)}</p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={openCheckoutModal}
                  className="mt-6 w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Checkout
                </button>
                
                <div className="mt-4">
                  <Link href="/store" className="text-black hover:underline flex items-center justify-center">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Guest Checkout Modal */}
      <GuestCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={closeCheckoutModal}
        cartItems={cartItems}
        subtotal={subtotal}
      />
    </div>
  );
} 