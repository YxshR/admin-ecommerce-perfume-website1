'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiShoppingBag, FiStar } from 'react-icons/fi';
import { useAuth } from '@/app/components/AuthProvider';
import Image from 'next/image';

// Custom event for cart updates
export const triggerMiniCartOpen = () => {
  // Create and dispatch a custom event that Nav.tsx can listen for
  const event = new CustomEvent('openMiniCart');
  window.dispatchEvent(event);
};

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  productType?: string;
  subCategories?: string[];
  images: { url: string }[] | string[];
  rating?: number;
  mainImage?: string;
  attributes?: {
    volume?: string;
  };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    
    // Using the improved AddToCartButton component's functionality directly
    import('@/app/components/AddToCartButton').then(module => {
      // Get the trigger function
      const { triggerMiniCartOpen } = module;
      
      // Update localStorage cart
      addToLocalStorageCart(false);
      
      // Show mini cart
      triggerMiniCartOpen();
      
      // Reset loading state
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 800);
    });
  };
  
  // Helper function to add item to localStorage cart
  const addToLocalStorageCart = (showAlert = true) => {
    try {
      // Get existing cart or initialize empty array
      const savedCart = localStorage.getItem('cart') || '[]';
      let cart = [];
      
      try {
        cart = JSON.parse(savedCart);
        if (!Array.isArray(cart)) {
          // Reset cart if it's invalid
          cart = [];
        }
      } catch (parseError) {
        // Reset cart on parse error
        cart = [];
      }
      
      // Check if product is already in cart
      const existingItemIndex = cart.findIndex((item: any) => item.id === product._id);
      
      if (existingItemIndex >= 0) {
        // If product exists, increase quantity
        cart[existingItemIndex].quantity += 1;
      } else {
        // Otherwise add new item
        cart.push({
          id: product._id,
          name: product.name,
          price: product.discountedPrice > 0 ? product.discountedPrice : product.price,
          image: getImageUrl(), // Use the same image URL function as in the component
          quantity: 1
        });
      }
      
      // Save updated cart
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Force UI update across components by manually triggering storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cart',
        newValue: JSON.stringify(cart),
        storageArea: localStorage
      }));
      
      // Also update a timestamp to force refresh
      localStorage.setItem('cart_updated', Date.now().toString());
      
      // Show success message if requested
      if (showAlert) {
        // Use mini cart instead of alert
        triggerMiniCartOpen();
      }
    } catch (error) {
      console.error('Error adding to localStorage cart:', error);
      alert('Failed to add product to cart. Please try again.');
    }
  };
  
  const discount = (product.discountedPrice > 0 && product.price > 0)
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) 
    : 0;
  
  // Generate stars for rating
  const renderRatingStars = () => {
    const stars = [];
    const rating = product.rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FiStar key={`star-${i}`} className="w-3 h-3 text-amber-800 fill-current" />
      );
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half-star" className="relative w-3 h-3">
          <FiStar className="w-3 h-3 text-amber-800 absolute" />
          <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
            <FiStar className="w-3 h-3 text-amber-800 fill-current" />
          </div>
        </div>
      );
    }
    
    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FiStar key={`empty-star-${i}`} className="w-3 h-3 text-amber-800" />
      );
    }
    
    return stars;
  };
  
  const getImageUrl = () => {
    if (imageError) {
      return '/perfume-placeholder.jpg';
    }
    
    // Check if product has a mainImage
    if (product.mainImage) {
      return product.mainImage;
    }
    
    // Check if images is an array of objects with url property
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage) {
        return firstImage.url;
      } else if (typeof firstImage === 'string') {
        return firstImage;
      }
    }
    
    // Fallback to placeholder
    return '/perfume-placeholder.jpg';
  };
  
  // Format price with commas for thousands
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  const volume = product.attributes?.volume || '';
  
  return (
    <Link href={`/product/${product._id}`}>
      <div 
        className="group relative bg-white border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image with elegant border */}
        <div className="aspect-[3/4] overflow-hidden relative bg-gray-50">
          <img
            src={getImageUrl()}
            alt={product.name}
            className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105 p-4"
            onError={() => setImageError(true)}
          />
          
          {/* Discount Badge - Elegant style */}
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-amber-800 text-white text-xs px-2 py-1 font-light tracking-wider">
              {discount}% OFF
            </div>
          )}
        </div>
        
        {/* Product Info - Premium styling */}
        <div className="p-4 border-t border-gray-100 bg-white">
          {/* Category in small caps */}
          <div className="mb-1">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-light">
              {product.category} {volume && `• ${volume}`}
            </span>
          </div>
          
          {/* Product Name - Elegant typography */}
          <h3 className="font-medium text-gray-900 mb-2 tracking-wide uppercase text-sm">
            {product.name}
          </h3>
          
          {/* Price with elegant styling */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {discount > 0 && product.discountedPrice ? (
                <>
                  <span className="text-sm font-medium text-gray-900">₹{formatPrice(product.discountedPrice)}</span>
                  <span className="ml-2 text-xs text-gray-400 line-through">₹{formatPrice(product.price)}</span>
                </>
              ) : (
                <span className="text-sm font-medium text-gray-900">₹{formatPrice(product.price)}</span>
              )}
            </div>
            
            {/* Rating stars with minimal styling */}
            <div className="flex items-center">
              {product.rating ? (
                <div className="flex items-center space-x-0.5">
                  {renderRatingStars()}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        
        {/* Add to Cart Button - Luxury style */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-white bg-opacity-95 transition-all duration-300 transform ${
            isHovered ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-full py-3 bg-amber-800 text-white uppercase text-sm tracking-wider font-light hover:bg-amber-900 transition-colors"
          >
            {isAddingToCart ? 'Adding...' : 'Add To Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
} 