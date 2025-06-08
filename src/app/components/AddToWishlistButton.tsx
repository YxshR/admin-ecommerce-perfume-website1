'use client';

import React, { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { WishlistService } from '@/app/services/WishlistService';
import { UserActivityTracker } from '@/app/services/UserActivityTracker';

interface AddToWishlistButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  className?: string;
  filled?: boolean;
  iconOnly?: boolean;
}

export default function AddToWishlistButton({
  productId,
  productName,
  productPrice,
  productImage,
  className = '',
  filled: initialFilled = false,
  iconOnly = false
}: AddToWishlistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [filled, setFilled] = useState(initialFilled);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Check if product is in wishlist when component loads
  useEffect(() => {
    const isInWishlist = WishlistService.isInWishlist(productId);
    setFilled(isInWishlist);
  }, [productId]);

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = () => {
      const isInWishlist = WishlistService.isInWishlist(productId);
      setFilled(isInWishlist);
    };
    
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    window.addEventListener('storage', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
      window.removeEventListener('storage', handleWishlistUpdate);
    };
  }, [productId]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    
    try {
      // If user is not authenticated, redirect to login
      if (!isAuthenticated) {
        // Save the current URL to redirect back after login
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }
      
      // Toggle the item in wishlist
      const newState = WishlistService.toggleItem({
        productId,
        name: productName,
        price: productPrice,
        image: productImage,
        addedAt: new Date().toISOString()
      });
      
      // Update UI state
      setFilled(newState);
      
      // If user is authenticated, sync with server
      await WishlistService.syncWithServer(true);
      
      // Track the event if item was added
      if (newState) {
        UserActivityTracker.trackAddToWishlist(
          productId, 
          productName, 
          user?.userId
        );
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    } finally {
      // Reset loading state after a short delay to show the animation
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`${className} ${filled ? 'text-red-500' : 'text-gray-600'} hover:text-red-500 transition-colors duration-200`}
      aria-label={filled ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg className="animate-pulse h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </span>
      ) : (
        <>
          <FiHeart 
            className={`h-6 w-6 ${filled ? 'fill-current' : ''}`} 
            stroke="currentColor" 
            strokeWidth="2"
          />
          {!iconOnly && (
            <span className="ml-2">
              {filled ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </span>
          )}
        </>
      )}
    </button>
  );
} 