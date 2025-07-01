'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiX, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';
import Script from 'next/script';
import { useAuth } from './AuthProvider';
import CheckoutProgress from '../checkout/CheckoutProgress';
import OrderSummary from '../checkout/OrderSummary';
import AddressFormModal from '../checkout/AddressFormModal';
import PhoneNumberModal from '../checkout/PhoneNumberModal';
import AddressCard from '../checkout/AddressCard';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Address {
  addressId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems?: CartItem[];
  subtotal?: number;
}

export default function CheckoutModal({ 
  isOpen, 
  onClose,
  cartItems: propCartItems,
  subtotal: propSubtotal
}: CheckoutModalProps) {
  const { isAuthenticated, user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'contact' | 'address' | 'payment'>(
    user?.phone ? 'address' : 'contact'
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderInstructions, setOrderInstructions] = useState('');
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Handle Razorpay script load
  const handleScriptLoad = () => {
    console.log("Razorpay script loaded successfully");
    setScriptLoaded(true);
  };

  useEffect(() => {
    // Load Razorpay script manually if needed
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log("Razorpay script loaded manually");
        setScriptLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay script manually");
      };
      document.body.appendChild(script);
    } else if (typeof window !== 'undefined' && window.Razorpay) {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Update cart items from props or fetch from API
    if (propCartItems && propCartItems.length > 0) {
      setCartItems(propCartItems);
      setSubtotal(propSubtotal || 0);
      setShippingPrice(propSubtotal && propSubtotal > 500 ? 0 : 50);
    } else {
      fetchCart();
    }
    
    // Set initial contact phone from user data
    if (user?.phone) {
      setContactPhone(user.phone);
    }
    
    // Fetch user addresses
    fetchUserAddresses();
    
    // Handle click outside modal
    // Removed the click outside to close functionality as requested
  }, [isOpen, user]);

  // Function to fetch the cart from API or localStorage
  const fetchCart = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from server first if authenticated
      if (isAuthenticated) {
        try {
          const response = await fetch('/api/cart', {
            credentials: 'include',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.cart && data.cart.items && data.cart.items.length > 0) {
              setCartItems(data.cart.items);
              
              // Calculate prices
              const subtotalAmount = data.cart.subtotal;
              setSubtotal(subtotalAmount);
              
              // Set shipping price (free shipping for orders over 500)
              const shippingAmount = subtotalAmount > 500 ? 0 : 50;
              setShippingPrice(shippingAmount);
              
              setLoading(false);
              return;
            }
          }
        } catch (serverError) {
          console.error('Error fetching server cart:', serverError);
        }
      }
      
      // Fall back to localStorage
      const savedCart = localStorage.getItem('cart') || '[]';
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          setCartItems(parsedCart);
          
          // Calculate subtotal
          const subtotalAmount = parsedCart.reduce(
            (sum: number, item: CartItem) => sum + item.price * item.quantity,
            0
          );
          setSubtotal(subtotalAmount);
          
          // Set shipping price (free shipping for orders over 500)
          const shippingAmount = subtotalAmount > 500 ? 0 : 50;
          setShippingPrice(shippingAmount);
        }
      } catch (localStorageError) {
        console.error('Error loading cart from localStorage:', localStorageError);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch user addresses
  const fetchUserAddresses = async () => {
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`/api/user/addresses?_=${timestamp}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && Array.isArray(data.addresses)) {
          setAddresses(data.addresses || []);
        
          // Set default address if available
          const defaultAddress = data.addresses?.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.addressId);
          } else if (data.addresses?.length > 0) {
            setSelectedAddressId(data.addresses[0].addressId);
          }
        } else {
          setIsAddingAddress(true);
        }
      } else {
        console.error('Failed to fetch addresses:', response.status);
        setIsAddingAddress(true);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setIsAddingAddress(true);
    }
  };

  // Handle adding a new address
  const handleAddAddress = async (newAddress: any) => {
    try {
      setLoading(true);
      console.log('Adding new address:', newAddress);
      
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: newAddress.fullName,
          phone: newAddress.phone,
          addressLine1: newAddress.addressLine1,
          addressLine2: newAddress.addressLine2 || '',
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode,
          isDefault: true
        }),
        credentials: 'include'
      });

      console.log('Address API response status:', response.status);
      const data = await response.json();
      console.log('Address API response data:', data);
      
      if (response.ok) {
        if (data.success) {
          console.log('Address added successfully:', data.address);
          await fetchUserAddresses();
          if (data.address && data.address.addressId) {
            setSelectedAddressId(data.address.addressId);
          }
          setIsAddingAddress(false);
        } else {
          console.error('API returned success: false', data.error);
          setErrorMessage(data.error || 'Failed to add address. Please try again.');
        }
      } else {
        console.error('Failed to add address:', response.status, data.error);
        setErrorMessage(data.error || 'Failed to add address. Please try again.');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle editing an address
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddingAddress(true);
  };

  // Proceed to payment
  const proceedToPayment = async () => {
    if (!selectedAddressId) {
      setErrorMessage('Please select a delivery address');
      return;
    }
    
    setCurrentStep('payment');
  };

  // Handle confirming phone number
  const handleConfirmPhone = (phone: string) => {
    setContactPhone(phone);
    setShowPhoneModal(false);
    setCurrentStep('address');
  };

  // Calculate final total with minimum of 1 rupee
  const calculateTotal = () => {
    const rawTotal = subtotal + shippingPrice - appliedDiscount;
    return Math.max(rawTotal, 1);
  };

  // Process final payment
  const processPayment = async () => {
    if (!selectedAddressId) {
      setErrorMessage('Please select a delivery address');
      return;
    }

    try {
      setProcessingOrder(true);
      setErrorMessage(null);
      
      // Get the selected address
      const selectedAddress = addresses.find(addr => addr.addressId === selectedAddressId);
      if (!selectedAddress) {
        throw new Error('Selected address not found');
      }
      
      // Calculate final total with minimum of 1 rupee
      const finalTotal = calculateTotal();
      
      const orderData = {
        shippingAddress: {
          fullName: selectedAddress.fullName,
          address: `${selectedAddress.addressLine1}, ${selectedAddress.addressLine2 || ''}`,
          city: selectedAddress.city,
          postalCode: selectedAddress.pincode,
          state: selectedAddress.state,
          country: 'India',
          phone: selectedAddress.phone
        },
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'Razorpay',
        cartItems,
        discountCode: discountApplied ? discountCode : '',
        discountAmount: appliedDiscount,
        shippingPrice: shippingPrice,
        totalPrice: finalTotal
      };
      
      // Create the order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(orderData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Order creation failed:", response.status, errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Failed to create order: ${response.status}`);
        } catch (e) {
          throw new Error(`Failed to create order: ${response.status}`);
        }
      }
      
      const data = await response.json();

      if (data.success && data.order) {
        const orderId = data.order.orderId || data.order._id;
        
        // If using COD, redirect to order confirmation
        if (paymentMethod === 'COD') {
          // Clear cart
          localStorage.setItem('cart', '[]');
          localStorage.setItem('cart_updated', Date.now().toString());
          
          // Dispatch storage event to update cart UI across components
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'cart',
            newValue: '[]',
            storageArea: localStorage
          }));
          
          // Close modal and redirect
          onClose();
          window.location.href = `/account/orders/${orderId}`;
        } else {
          // For online payment, initialize Razorpay
          try {
            // Fetch Razorpay order details
            const razorResponse = await fetch('/api/payment/razorpay/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderId }),
            });
            
            if (!razorResponse.ok) {
              const errorText = await razorResponse.text();
              console.error("Razorpay initialization failed:", razorResponse.status, errorText);
              throw new Error(`Failed to initialize payment: ${razorResponse.status}`);
            }
            
            const razorData = await razorResponse.json();
            
            if (!razorData.success) {
              throw new Error(razorData.error || 'Failed to initialize payment');
            }
            
            // Check if Razorpay is loaded
            if (!window.Razorpay) {
              throw new Error('Payment gateway is not loaded. Please refresh the page.');
            }
            
            // Create Razorpay options
            const options = {
              key: razorData.key_id,
              amount: razorData.order.totalAmount,
              currency: razorData.order.currency,
              name: 'Avito Scent',
              description: 'Premium Fragrances',
              order_id: razorData.order.id,
              handler: async function(response: any) {
                try {
                  // Verify payment with server
                  const verifyResponse = await fetch('/api/payment/razorpay/verify', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_signature: response.razorpay_signature,
                      orderId,
                    }),
                  });

                  if (!verifyResponse.ok) {
                    throw new Error('Payment verification failed');
                  }

                  const verifyData = await verifyResponse.json();
                  
                  if (!verifyData.success) {
                    throw new Error(verifyData.error || 'Payment verification failed');
                  }

                  // Clear cart
                  localStorage.setItem('cart', '[]');
                  localStorage.setItem('cart_updated', Date.now().toString());
                  
                  // Dispatch event to update cart UI
                  window.dispatchEvent(new StorageEvent('storage', {
                    key: 'cart',
                    newValue: '[]',
                    storageArea: localStorage
                  }));
                  
                  // Close modal and redirect to order confirmation
                  onClose();
                  window.location.href = `/account/orders/${orderId}`;
                } catch (error) {
                  console.error('Payment verification error:', error);
                  alert('Payment verification failed. Please contact customer support.');
                }
              },
              prefill: {
                name: razorData.user.name || '',
                email: razorData.user.email || '',
                contact: razorData.user.contact || '',
              },
              notes: {
                orderId: orderId,
              },
              theme: {
                color: '#000000',
              },
              modal: {
                ondismiss: function() {
                  setProcessingOrder(false);
                }
              }
            };
            
            // Create and open Razorpay
            const razorpay = new window.Razorpay(options);
            razorpay.open();
            
          } catch (paymentError) {
            console.error('Payment error:', paymentError);
            setErrorMessage(paymentError instanceof Error ? paymentError.message : 'Failed to process payment');
            setProcessingOrder(false);
          }
        }
      } else {
        throw new Error(data.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create order');
      setProcessingOrder(false);
    }
  };

  // Apply discount code
  const applyDiscount = async () => {
    if (!discountCode) {
      setShowDiscountInput(true);
      return;
    }
    
    try {
      // Call the API to validate the coupon
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: discountCode }),
      });
      
      const data = await response.json();
      
      if (data.success && data.coupon) {
        // Apply discount from the API response
        setAppliedDiscount(data.coupon.discount || 0);
        
        // Remove shipping charge if free shipping is included
        if (data.coupon.freeShipping) {
          setShippingPrice(0);
        }
        
        setDiscountApplied(true);
        setShowDiscountInput(false);
        
        // Show success message
        alert(`Discount code applied successfully! ${data.coupon.description}`);
      } else {
        // Invalid code
        alert(data.error || 'Invalid discount code. Please try again.');
        setDiscountCode('');
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      alert('Failed to apply discount code. Please try again.');
      setDiscountCode('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      {/* Load Razorpay script */}
      <Script
        id="razorpay-checkout"
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleScriptLoad}
        onError={() => {
          console.error("Failed to load Razorpay script via Next.js Script");
        }}
        strategy="beforeInteractive"
      />
      
      <div 
        ref={modalRef} 
        className="bg-white w-full max-w-3xl rounded-lg shadow-lg my-8 relative"
        style={{ maxHeight: 'calc(100vh - 40px)' }}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-10"
          aria-label="Close modal"
        >
          <FiX size={24} />
        </button>

        {/* Merchant Header */}
        <div className="flex items-center p-4 border-b">
          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden relative mr-3">
            <Image 
              src="/logo.jpg" 
              alt="Avito Scent" 
              width={40} 
              height={40}
            />
          </div>
          <div>
            <h2 className="font-medium">Avito Scent</h2>
            <div className="flex items-center text-xs text-green-600">
              <span className="bg-green-100 text-green-600 px-1 mr-1 rounded">✓</span>
              Razorpay Trusted Business
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <CheckoutProgress currentStep={currentStep} />

        {/* Content Area */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {/* Phone Number Section - for contact step */}
          {currentStep === 'contact' && (
            <div className="p-6">
              <h1 className="text-xl font-semibold mb-4">Contact</h1>
              <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-500">+91</span>
                  </div>
                  <span>{contactPhone || 'Add phone number'}</span>
                </div>
                <button 
                  onClick={() => setShowPhoneModal(true)}
                  className="text-blue-600 text-sm"
                >
                  {contactPhone ? 'Edit' : 'Add'}
                </button>
              </div>
              
              <button
                onClick={() => contactPhone ? setCurrentStep('address') : setShowPhoneModal(true)}
                disabled={!contactPhone}
                className={`w-full py-3 rounded-md font-medium ${
                  !contactPhone 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-black text-white'
                }`}
              >
                Continue
              </button>
            </div>
          )}

          {/* Address Section - for address step */}
          {currentStep === 'address' && (
            <div className="p-6">
              <h1 className="text-xl font-semibold mb-4">Add delivery address</h1>
              
              {/* Address List */}
              {addresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  {addresses.map(address => (
                    <AddressCard
                      key={address.addressId}
                      address={address}
                      isSelected={selectedAddressId === address.addressId}
                      onSelect={setSelectedAddressId}
                      onEdit={handleEditAddress}
                    />
                  ))}
                </div>
              )}
              
              {/* Add Address Button */}
              <button
                onClick={() => setIsAddingAddress(true)}
                className="w-full border border-gray-300 rounded-lg p-4 text-center text-blue-600 hover:bg-gray-50 mb-4"
              >
                + Add a new address
              </button>
              
              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
                  {errorMessage}
                </div>
              )}
              
              {/* Continue Button */}
              <button
                onClick={proceedToPayment}
                disabled={!selectedAddressId}
                className={`w-full py-3 rounded-md font-medium ${
                  !selectedAddressId 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-black text-white'
                }`}
              >
                Continue
              </button>
            </div>
          )}

          {/* Payment Section - for payment step */}
          {currentStep === 'payment' && (
            <div className="p-6">
              <div className="flex mb-6">
                <div className="w-1/2">
                  <h2 className="text-lg font-medium mb-4">Payment Methods</h2>
                  
                  <div className="space-y-3">
                    {/* UPI Option */}
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer ${
                        paymentMethod === 'Online' ? 'border-blue-500' : ''
                      }`}
                      onClick={() => setPaymentMethod('Online')}
                    >
                      <div className="flex items-center mb-2">
                        <input 
                          type="radio" 
                          id="payment-online"
                          checked={paymentMethod === 'Online'} 
                          onChange={() => setPaymentMethod('Online')}
                          className="mr-3" 
                        />
                        <div className="font-medium">Pay Online (UPI/Card/NetBanking)</div>
                      </div>
                      
                      {paymentMethod === 'Online' && (
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          <div className="border rounded p-2 flex items-center justify-center">
                            <img src="/payment-icons/visa.png" alt="Visa" className="h-6 w-auto object-contain" />
                          </div>
                          <div className="border rounded p-2 flex items-center justify-center">
                            <img src="/payment-icons/mastercard.png" alt="Mastercard" className="h-6 w-auto object-contain" />
                          </div>
                          <div className="border rounded p-2 flex items-center justify-center">
                            <img src="/payment-icons/gpay.png" alt="Google Pay" className="h-6 w-auto object-contain" />
                          </div>
                          <div className="border rounded p-2 flex items-center justify-center">
                            <img src="/payment-icons/phonepe.png" alt="PhonePe" className="h-6 w-auto object-contain" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* COD Option */}
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer ${
                        paymentMethod === 'COD' ? 'border-blue-500' : ''
                      }`}
                      onClick={() => setPaymentMethod('COD')}
                    >
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          checked={paymentMethod === 'COD'} 
                          onChange={() => setPaymentMethod('COD')}
                          className="mr-3" 
                        />
                        <div className="font-medium">Cash on Delivery</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-1/2 pl-6">
                  <h2 className="text-lg font-medium mb-4">Apply Discount</h2>
                  
                  {/* Discount Coupon Section */}
                  <div className="border rounded-lg p-4">
                    {showDiscountInput ? (
                      <div className="flex w-full items-center">
                        <input
                          type="text"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          placeholder="Enter coupon code"
                          className="flex-grow border rounded-l px-3 py-2 text-sm"
                        />
                        <button
                          onClick={applyDiscount}
                          className="bg-black text-white px-4 py-2 rounded-r text-sm"
                        >
                          Apply
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="w-full text-blue-600 text-sm font-medium flex items-center justify-center py-2"
                        onClick={() => discountApplied ? alert('Discount already applied!') : setShowDiscountInput(true)}
                      >
                        {discountApplied ? `Discount applied: ${discountCode}` : 'Add a coupon code'}
                        {!discountApplied && <FiChevronRight className="ml-1" />}
                      </button>
                    )}
                    
                    {discountApplied && (
                      <div className="mt-2 text-green-600 text-sm">
                        ✓ Saved ₹{appliedDiscount.toFixed(2)} with this coupon
                        {shippingPrice === 0 && ' + Free Shipping'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Payment Controls */}
              <div className="flex justify-between pt-4 border-t">
                <button 
                  onClick={() => setCurrentStep('address')}
                  className="px-4 py-2 border border-gray-300 rounded"
                >
                  Back
                </button>
                <button
                  onClick={processPayment}
                  disabled={processingOrder}
                  className={`px-6 py-2 rounded font-medium ${
                    processingOrder 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-black text-white'
                  }`}
                >
                  {processingOrder ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          )}

          {/* Order Summary - Shown on all steps */}
        <div className="border-t p-4">
          <div className="flex justify-between items-center cursor-pointer mb-2">
            <h3 className="font-medium">Order summary</h3>
            <FiChevronRight />
          </div>
          
          {cartItems.length > 0 && (
            <div>
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center py-2">
                  <div className="w-10 h-10 relative flex-shrink-0 mr-3 border">
                    <Image 
                      src={item.image || "/images/placeholder-product.jpg"} 
                      alt={item.name} 
                      fill
                      sizes="40px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span className="text-sm">₹{subtotal.toFixed(2)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm">Discount</span>
                    <span className="text-sm">-₹{appliedDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm">Shipping charge</span>
                  <span className="text-sm">{shippingPrice > 0 ? `₹${shippingPrice.toFixed(2)}` : 'Free'}</span>
                </div>
              </div>
              
              <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                <span>Total</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
        </div>

        
      </div>
      
      {/* Phone Number Modal */}
      <PhoneNumberModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onConfirm={handleConfirmPhone}
        initialPhoneNumber={contactPhone}
        stopPropagation={true}
      />
      
      {/* Address Form Modal */}
      {isAddingAddress && (
        <AddressFormModal
          isOpen={isAddingAddress}
          onClose={() => {
            setIsAddingAddress(false);
            setEditingAddress(null);
          }}
          onAddAddress={handleAddAddress}
          stopPropagation={true}
        />
      )}
    </div>
  );
} 