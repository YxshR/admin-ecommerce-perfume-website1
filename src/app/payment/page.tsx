'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';
import { FiArrowLeft, FiCreditCard, FiDollarSign, FiShield, FiCheckCircle } from 'react-icons/fi';
import Script from 'next/script';

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

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface SavedAddress {
  addressId: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

type PaymentMethod = 'Razorpay' | 'UPI' | 'COD';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Razorpay');
  const [subtotal, setSubtotal] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [total, setTotal] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [upiId, setUpiId] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script manually
    if (typeof window !== 'undefined') {
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          console.log("Razorpay script loaded manually");
          setScriptLoaded(true);
        };
        script.onerror = () => {
          console.error("Failed to load Razorpay script manually");
          setError("Failed to load payment gateway. Please try again.");
        };
        document.body.appendChild(script);
      } else {
        console.log("Razorpay already available");
        setScriptLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    // Get order ID from search params
    const orderIdFromParams = searchParams?.get('orderId');
    if (orderIdFromParams) {
      console.log("Order ID from params:", orderIdFromParams);
      setOrderId(orderIdFromParams);
    }

    // Get addresses and cart data
    fetchData();
  }, [isAuthenticated, router, searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Check for address ID in query params
      const addressId = searchParams?.get('addressId');
      if (addressId) {
        await fetchSelectedAddress(addressId);
      } else {
        // For backward compatibility
        const savedShippingAddress = localStorage.getItem('shippingAddress');
        if (savedShippingAddress) {
          setShippingAddress(JSON.parse(savedShippingAddress));
        } else {
          // Instead of redirecting to /checkout, go back to homepage
          router.push('/');
          return;
        }
      }
      
      // Fetch cart from API
      await fetchCart();
    } catch (error) {
      console.error('Error loading data:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedAddress = async (addressId: string) => {
    try {
      const response = await fetch('/api/user/addresses', {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const selectedAddress = data.addresses.find(
          (addr: SavedAddress) => addr.addressId === addressId
        );
        
        if (!selectedAddress) {
          throw new Error('Selected address not found');
        }
        
        // Convert to shipping address format
        setShippingAddress({
          fullName: selectedAddress.fullName,
          address: selectedAddress.addressLine1 + (selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''),
          city: selectedAddress.city,
          postalCode: selectedAddress.pincode,
          country: selectedAddress.country,
          phone: selectedAddress.phone,
        });
      } else {
        throw new Error(data.error || 'Failed to fetch address');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      throw error;
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.cart.items);
        
        // Calculate prices
        const subtotalAmount = data.cart.subtotal;
        setSubtotal(subtotalAmount);
        
        // Set shipping price (free shipping for orders over 500)
        const shippingAmount = subtotalAmount > 500 ? 0 : 50;
        setShippingPrice(shippingAmount);
        
        // Calculate total
        setTotal(subtotalAmount + shippingAmount);
      } else {
        throw new Error(data.error || 'Failed to fetch cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  };

  // Initialize Razorpay payment
  const initializeRazorpay = useCallback(async () => {
    console.log("Initializing Razorpay payment:", { 
      scriptLoaded, 
      windowRazorpay: !!window.Razorpay, 
      orderId 
    });
    
    if (!window.Razorpay) {
      setError("Payment gateway is not loaded. Please refresh the page and try again.");
      setProcessing(false);
      return;
    }
    
    if (!orderId) {
      setError("Order ID is missing. Please try again.");
      setProcessing(false);
      return;
    }
    
    try {
      setProcessing(true);
      setError('');

      console.log("Fetching order details for orderId:", orderId);
      
      // Fetch order details from server
      const response = await fetch('/api/payment/razorpay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      console.log("Create API response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Failed to initialize payment (${response.status})`);
        } catch (e) {
          throw new Error(`Failed to initialize payment (${response.status})`);
        }
      }

      const data = await response.json();
      console.log("Create API response data:", data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Create Razorpay instance
      const options = {
        key: data.key_id,
        amount: data.order.totalAmount,
        currency: data.order.currency,
        name: 'Avito Scent',
        description: 'Premium Fragrances',
        order_id: data.order.id,
        handler: function(response: any) {
          console.log("Razorpay payment successful:", response);
          handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed");
            setProcessing(false);
          }
        },
        prefill: {
          name: data.user.name || '',
          email: data.user.email || '',
          contact: data.user.contact || '',
        },
        notes: {
          orderId: orderId,
        },
        theme: {
          color: '#000000',
        },
      };

      console.log("Creating Razorpay instance with options:", options);
      const razorpay = new window.Razorpay(options);
      
      console.log("Opening Razorpay payment modal");
      razorpay.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize payment');
      setProcessing(false);
    }
  }, [orderId]);

  // Handle payment success
  const handlePaymentSuccess = async (response: any) => {
    try {
      console.log("Handling payment success:", response);
      setProcessing(true);
      
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

      console.log("Verification API response status:", verifyResponse.status);
      
      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        console.error("Error response:", errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Payment verification failed (${verifyResponse.status})`);
        } catch (e) {
          throw new Error(`Payment verification failed (${verifyResponse.status})`);
        }
      }

      const verifyData = await verifyResponse.json();
      console.log("Verification API response data:", verifyData);
      
      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      // Clear cart
      localStorage.removeItem('cart');
      
      // Redirect to order confirmation
      console.log("Redirecting to order confirmation page");
      router.push(`/order-confirmation?id=${orderId}`);
    } catch (error) {
      console.error('Payment verification error:', error);
      setError(error instanceof Error ? error.message : 'Payment verification failed');
      setProcessing(false);
    }
  };

  // Handle payment
  const handlePayment = async () => {
    console.log("Payment button clicked:", { paymentMethod });
    setError('');
    setProcessing(true);
    
    try {
      if (paymentMethod === 'Razorpay') {
        if (orderId) {
          // Initialize Razorpay payment
          initializeRazorpay();
          return;
        }
        
        // Create order object
        const orderData = {
          user: user?.userId,
          items: cartItems.map(item => ({
            product: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          shippingAddress,
          paymentMethod,
          itemsPrice: subtotal,
          shippingPrice,
          taxPrice: 0,
          totalPrice: total,
          isPaid: false,
          isDelivered: false,
          status: 'Pending'
        };
        
        console.log("Creating order:", orderData);
        
        // Send order to the API
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
          credentials: 'include'
        });
        
        console.log("Order creation response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.error || `Failed to create order (${response.status})`);
          } catch (e) {
            throw new Error(`Failed to create order (${response.status})`);
          }
        }
        
        const successData = await response.json();
        console.log("Order creation response data:", successData);
        
        const newOrderId = successData.order?._id || 'unknown';
        console.log("Order created with ID:", newOrderId);
        
        // Set order ID and initialize payment
        setOrderId(newOrderId);
        
        // Wait for state update before initializing Razorpay
        setTimeout(() => {
          initializeRazorpay();
        }, 100);
      } else if (paymentMethod === 'UPI') {
        if (!upiId || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
          throw new Error('Please enter a valid UPI ID');
        }

        // Create order object for UPI
        const orderData = {
          user: user?.userId,
          items: cartItems.map(item => ({
            product: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          shippingAddress,
          paymentMethod: 'UPI',
          itemsPrice: subtotal,
          shippingPrice,
          taxPrice: 0,
          totalPrice: total,
          isPaid: false,
          isDelivered: false,
          status: 'Pending',
          upiId
        };
        
        console.log("Creating UPI order:", orderData);
        
        // Send order to the API
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
          credentials: 'include'
        });
        
        console.log("UPI order creation response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.error || `Failed to create order (${response.status})`);
          } catch (e) {
            throw new Error(`Failed to create order (${response.status})`);
          }
        }
        
        const successData = await response.json();
        console.log("UPI order creation response data:", successData);
        
        const orderId = successData.order?._id || 'unknown';
        
        // Redirect to UPI payment page (would need implementation)
        router.push(`/payment/upi?orderId=${orderId}`);

      } else if (paymentMethod === 'COD') {
        // Create order object for COD
        const orderData = {
          user: user?.userId,
          items: cartItems.map(item => ({
            product: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          shippingAddress,
          paymentMethod: 'COD',
          paymentResult: {
            id: `COD-${Date.now()}`,
            status: 'Pending',
            update_time: new Date().toISOString(),
          },
          itemsPrice: subtotal,
          shippingPrice,
          taxPrice: 0,
          totalPrice: total,
          isPaid: false,
          isDelivered: false,
          status: 'Processing'
        };
        
        console.log("Creating COD order:", orderData);
        
        // Send order to the API
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
          credentials: 'include'
        });
        
        console.log("COD order creation response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.error || `Failed to create order (${response.status})`);
          } catch (e) {
            throw new Error(`Failed to create order (${response.status})`);
          }
        }
        
        const successData = await response.json();
        console.log("COD order creation response data:", successData);
        
        const orderId = successData.order?._id || 'unknown';
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Redirect to order confirmation
        router.push(`/order-confirmation?id=${orderId}`);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment processing');
      setProcessing(false);
    }
  };

  // Handle Razorpay script load
  const handleScriptLoad = () => {
    console.log("Razorpay script loaded via Next.js Script component");
    setScriptLoaded(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Load Razorpay script */}
      <Script
        id="razorpay-checkout"
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleScriptLoad}
        onError={() => {
          console.error("Failed to load Razorpay script via Next.js Script");
          setError("Failed to load payment gateway. Please try again.");
        }}
        strategy="beforeInteractive"
      />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/checkout" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <FiArrowLeft className="mr-2" /> Back to Shipping
          </Link>
        </div>

        <h1 className="text-3xl font-medium text-center mb-8">Payment Method</h1>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-7">
            <div className="bg-white shadow-sm border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-medium mb-6">Select Payment Method</h2>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4 flex items-start">
                  <input
                    type="radio"
                    id="razorpay"
                    name="paymentMethod"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="mt-1"
                  />
                  <label htmlFor="razorpay" className="ml-3 flex-1">
                    <div className="flex items-center">
                      <FiCreditCard className="text-blue-600 mr-2" />
                      <span className="font-medium">Pay Online (Card/UPI/Wallet)</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Pay securely with Razorpay</p>
                    
                    {paymentMethod === 'Razorpay' && (
                      <div className="mt-4 grid grid-cols-6 gap-2">
                        <div className="border rounded p-2 flex items-center justify-center">
                          <img src="https://cdn.razorpay.com/bank-logos/VISA.svg" alt="Visa" className="h-6" />
                        </div>
                        <div className="border rounded p-2 flex items-center justify-center">
                          <img src="https://cdn.razorpay.com/bank-logos/MC.svg" alt="Mastercard" className="h-6" />
                        </div>
                        <div className="border rounded p-2 flex items-center justify-center">
                          <img src="https://cdn.razorpay.com/bank-logos/RUPAY.svg" alt="Rupay" className="h-6" />
                        </div>
                        <div className="border rounded p-2 flex items-center justify-center">
                          <img src="https://cdn.razorpay.com/bank-logos/GPAY.svg" alt="Google Pay" className="h-6" />
                        </div>
                        <div className="border rounded p-2 flex items-center justify-center">
                          <img src="https://cdn.razorpay.com/bank-logos/PHONEPE.svg" alt="PhonePe" className="h-6" />
                        </div>
                        <div className="border rounded p-2 flex items-center justify-center">
                          <img src="https://cdn.razorpay.com/bank-logos/PAYTM.svg" alt="Paytm" className="h-6" />
                        </div>
                      </div>
                    )}
                  </label>
                </div>
                
                <div className="border rounded-lg p-4 flex items-start">
                  <input
                    type="radio"
                    id="upi"
                    name="paymentMethod"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="mt-1"
                  />
                  <label htmlFor="upi" className="ml-3 flex-1">
                    <div className="flex items-center">
                      <FiDollarSign className="text-green-600 mr-2" />
                      <span className="font-medium">UPI Direct</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Pay using UPI ID directly</p>
                    
                    {paymentMethod === 'UPI' && (
                      <div className="mt-4">
                        <label htmlFor="upiId" className="block text-sm mb-1">UPI ID</label>
                        <input
                          type="text"
                          id="upiId"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@upi"
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    )}
                  </label>
                </div>
                
                <div className="border rounded-lg p-4 flex items-start">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1"
                  />
                  <label htmlFor="cod" className="ml-3 flex-1">
                    <div className="flex items-center">
                      <FiShield className="text-gray-600 mr-2" />
                      <span className="font-medium">Cash on Delivery</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Pay when you receive your order</p>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow-sm border rounded-lg p-6">
              <h2 className="text-xl font-medium mb-6">Shipping Address</h2>
              
              {shippingAddress && (
                <div className="text-sm space-y-2">
                  <p className="font-medium">{shippingAddress.fullName}</p>
                  <p>{shippingAddress.address}</p>
                  <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                  <p>{shippingAddress.country}</p>
                  <p>Phone: {shippingAddress.phone}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white shadow-sm border rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-medium mb-6">Order Summary</h2>
              
              <div className="space-y-4 divide-y">
                <div className="pb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-2 flex items-center">
                      <div className="w-10 h-10 flex-shrink-0 overflow-hidden border">
                        <img 
                          src={item.image || 'https://placehold.co/200x200'} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="py-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Shipping</span>
                    <span className="text-sm">{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              <div className="mt-6">
                <button 
                  onClick={handlePayment} 
                  disabled={processing}
                  className={`w-full py-3 bg-black text-white hover:bg-gray-900 flex items-center justify-center ${
                    processing ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {processing ? (
                    <>
                      <div className="mr-2 animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="mr-2" /> 
                      {paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'}
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-sm text-gray-500 text-center mt-4">
                By placing your order, you agree to our terms and conditions and privacy policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 