'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Using Next.js Image for better optimization
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
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          // Take top 6 highest discounted products
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
  
  if (!isMounted) return null;
  
  if (loading && displayProducts.length === 0) {
    return (
      <div className="w-full h-[250px] xs:h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-sm sm:text-base md:text-lg">Loading fragrances...</div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-[250px] xs:h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px] overflow-hidden bg-gray-50">
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
              <div className="order-1 md:order-1 flex items-center justify-center h-[150px] xs:h-[170px] sm:h-[200px] md:h-full bg-gray-100 relative">
                <div className="relative w-full h-full max-w-[90%] md:max-w-[80%] flex items-center justify-center">
                  {/* Using picture element for better browser compatibility */}
                  <picture>
                    <source 
                      srcSet={displayProducts[currentIndex].images && displayProducts[currentIndex].images[0]?.url || '/perfume-placeholder.jpg'} 
                      type="image/webp"
                    />
                    <source 
                      srcSet={displayProducts[currentIndex].images && displayProducts[currentIndex].images[0]?.url || '/perfume-placeholder.jpg'} 
                      type="image/jpeg"
                    />
                    <img
                      src={displayProducts[currentIndex].images && displayProducts[currentIndex].images[0]?.url || '/perfume-placeholder.jpg'}
                      alt={displayProducts[currentIndex].name || "Perfume product"}
                      className="object-contain w-auto h-auto max-h-full max-w-full"
                      loading="eager"
                      onError={(e) => {
                        // Fallback to placeholder on error
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite loop
                        target.src = '/perfume-placeholder.jpg';
                      }}
                    />
                  </picture>
                </div>
              </div>
              
              {/* Content - Mobile: Bottom, Desktop: Right */}
              <div className="order-2 md:order-2 flex flex-col items-center justify-center p-2 xs:p-3 sm:p-4 md:p-5 lg:p-8">
                <div className="text-center space-y-1 xs:space-y-1.5 sm:space-y-2 md:space-y-3 lg:space-y-4 max-w-[95%] xs:max-w-[90%] sm:max-w-sm mx-auto">
                  <div className="bg-red-600 text-white inline-block px-1.5 xs:px-2 py-0.5 xs:py-1 text-[10px] xs:text-xs uppercase tracking-wider mb-0.5 xs:mb-1 md:mb-2">
                    {Math.round(displayProducts[currentIndex].discountPercentage || 0)}% OFF
                  </div>
                  <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold line-clamp-2">
                    {displayProducts[currentIndex].name}
                  </h2>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 line-clamp-2 md:line-clamp-3">
                    {displayProducts[currentIndex].description}
                  </p>
                  
                  <div className="flex items-center justify-center mt-0.5 xs:mt-1 sm:mt-1.5 md:mt-2 lg:mt-4 space-x-1.5 xs:space-x-2 md:space-x-3 lg:space-x-4">
                    <span className="text-sm xs:text-base sm:text-lg md:text-xl font-bold">
                      ₹{displayProducts[currentIndex].discountedPrice.toFixed(0)}
                    </span>
                    <span className="text-[10px] xs:text-xs text-gray-500 line-through">
                      MRP ₹{displayProducts[currentIndex].price.toFixed(0)}
                    </span>
                  </div>
                  
                  <div className="mt-1.5 xs:mt-2 sm:mt-3 md:mt-4">
                    <ShopNowButton href={`/product/${displayProducts[currentIndex]._id}`} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation arrows - more accessible and responsive */}
      {displayProducts.length > 1 && (
        <>
          <button 
            onClick={goToPrev}
            className="absolute top-1/2 left-1 xs:left-2 sm:left-3 md:left-4 -translate-y-1/2 z-20 bg-white/80 text-black p-1 sm:p-1.5 md:p-2 rounded-full shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            aria-label="Previous product"
          >
            <FiChevronLeft className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={goToNext}
            className="absolute top-1/2 right-1 xs:right-2 sm:right-3 md:right-4 -translate-y-1/2 z-20 bg-white/80 text-black p-1 sm:p-1.5 md:p-2 rounded-full shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            aria-label="Next product"
          >
            <FiChevronRight className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}
      
      {/* Dots indicator - more responsive and accessible */}
      <div className="absolute bottom-1 xs:bottom-1.5 sm:bottom-2 md:bottom-3 lg:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-1.5 md:space-x-2 z-20">
        {displayProducts.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 ${
              i === currentIndex ? 'bg-black' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  );
}