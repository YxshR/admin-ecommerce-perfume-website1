'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ShopNowButton from './ui/ShopNowButton';

// Types
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  images: { url: string }[];
  discountPercentage?: number;
}

// Convert USD to INR
const convertToRupees = (dollarPrice: number) => {
  // Just return the original price without conversion
  return dollarPrice;
};

export default function SaleCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch products with highest discount percentage
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        // Filter for products with discount and calculate discount percentage
        const discountedProducts = data.products
          .filter((product: any) => {
            // Ensure both price and discounted price exist and are valid numbers
            return product.price && product.comparePrice && 
                  product.price > 0 && product.comparePrice > 0 &&
                  product.price > product.comparePrice;
          })
          .map((product: any) => {
            // Convert prices to rupees
            const price = convertToRupees(product.price);
            const discountedPrice = convertToRupees(product.comparePrice);
            
            // Calculate discount percentage
            const discountPercentage = ((price - discountedPrice) / price * 100);
            
            // Normalize the product images structure
            let images = [];
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
              images = product.images.map((img: any) => {
                if (typeof img === 'string') {
                  return { url: img };
                } else if (img && img.url) {
                  return img;
                }
                return null;
              }).filter(Boolean);
            }
            
            // If no valid images found, use mainImage as fallback
            if (images.length === 0 && product.mainImage) {
              images = [{ url: product.mainImage }];
            }
            
            // If still no images, use placeholder
            if (images.length === 0) {
              images = [{ url: '/perfume-placeholder.jpg' }];
            }
            
            return {
              ...product,
              price,
              discountedPrice,
              discountPercentage,
              images
            };
          })
          // Sort by discount percentage (highest first)
          .sort((a: any, b: any) => b.discountPercentage - a.discountPercentage)
          // Take top 6 highest discounted products (reduced from 10)
          .slice(0, 6);
        
        setProducts(discountedProducts);
      } catch (err: any) {
        // Silent error handling for security
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
  };
  
  // Auto advance slides every 5 seconds
  useEffect(() => {
    if (products.length <= 1) return;
    
    const timer = setInterval(() => {
      goToNext();
    }, 5000);
    
    return () => clearInterval(timer);
  }, [products, currentIndex]);
  
  // Mock data in case no products with discount are found
  const mockProducts: Product[] = [
    {
      _id: 'mock1',
      name: 'Wild Escape',
      description: 'Citrus | Musk',
      price: convertToRupees(1699),
      discountedPrice: convertToRupees(1299),
      discountPercentage: 23.5,
      images: [{ url: '/perfume-placeholder.jpg' }]
    },
    {
      _id: 'mock2',
      name: 'Baked Vanilla',
      description: 'Vanilla | Gourmand',
      price: convertToRupees(1699),
      discountedPrice: convertToRupees(1299),
      discountPercentage: 23.5,
      images: [{ url: '/perfume-placeholder.jpg' }]
    },
    {
      _id: 'mock3',
      name: 'Devil\'s Berry',
      description: 'Dark Berry',
      price: convertToRupees(1699),
      discountedPrice: convertToRupees(1299),
      discountPercentage: 23.5,
      images: [{ url: '/perfume-placeholder.jpg' }]
    }
  ];
  
  // Use mock data if no products found or loading
  const displayProducts = products.length > 0 ? products : mockProducts;
  
  if (loading && displayProducts.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-lg">Loading fragrances...</div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-[300px] xs:h-[350px] sm:h-[400px] md:h-[500px] overflow-hidden bg-gray-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          {displayProducts[currentIndex] && (
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              {/* Image - Mobile: Top, Desktop: Left */}
              <div className="order-1 md:order-1 flex items-center justify-center h-[180px] xs:h-[200px] sm:h-[220px] md:h-full bg-gray-100">
                <img
                  src={displayProducts[currentIndex].images && displayProducts[currentIndex].images[0]?.url || '/perfume-placeholder.jpg'}
                  alt={displayProducts[currentIndex].name || "Perfume product"}
                  className="object-contain w-auto h-full max-h-full max-w-[90%] md:max-w-[80%]"
                  onError={(e) => {
                    // Fallback to placeholder on error
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Prevent infinite loop
                    target.src = '/perfume-placeholder.jpg';
                  }}
                />
              </div>
              
              {/* Content - Mobile: Bottom, Desktop: Right */}
              <div className="order-2 md:order-2 flex flex-col items-center justify-center p-3 xs:p-4 md:p-6 lg:p-8">
                <div className="text-center space-y-1 xs:space-y-2 md:space-y-4 max-w-sm mx-auto">
                  <div className="bg-red-600 text-white inline-block px-2 py-1 text-xs uppercase tracking-wider mb-1 md:mb-2">
                    {Math.round(displayProducts[currentIndex].discountPercentage || 0)}% OFF
                  </div>
                  <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold line-clamp-2">
                    {displayProducts[currentIndex].name}
                  </h2>
                  <p className="text-xs xs:text-sm text-gray-600 line-clamp-2 md:line-clamp-3">
                    {displayProducts[currentIndex].description}
                  </p>
                  
                  <div className="flex items-center justify-center mt-1 xs:mt-2 md:mt-4 space-x-2 md:space-x-4">
                    <span className="text-base xs:text-lg md:text-xl font-bold">
                      ₹{displayProducts[currentIndex].discountedPrice.toFixed(0)}
                    </span>
                    <span className="text-xs xs:text-sm text-gray-500 line-through">
                      MRP ₹{displayProducts[currentIndex].price.toFixed(0)}
                    </span>
                  </div>
                  
                  <div className="mt-2 md:mt-4">
                    <ShopNowButton href={`/product/${displayProducts[currentIndex]._id}`} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation arrows */}
      {displayProducts.length > 1 && (
        <>
          <button 
            onClick={goToPrev}
            className="absolute top-1/2 left-1 xs:left-2 sm:left-4 -translate-y-1/2 z-20 bg-white/80 text-black p-1 sm:p-2 rounded-full shadow-md hover:bg-white"
            aria-label="Previous product"
          >
            <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={goToNext}
            className="absolute top-1/2 right-1 xs:right-2 sm:right-4 -translate-y-1/2 z-20 bg-white/80 text-black p-1 sm:p-2 rounded-full shadow-md hover:bg-white"
            aria-label="Next product"
          >
            <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}
      
      {/* Dots indicator */}
      <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2 z-20">
        {displayProducts.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full transition-all ${
              i === currentIndex ? 'bg-black' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}