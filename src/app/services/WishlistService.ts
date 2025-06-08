'use client';

import { useState, useEffect } from 'react';

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: string;
}

export const WishlistService = {
  // Get wishlist items from localStorage
  getWishlistItems: (): WishlistItem[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error('Error loading wishlist:', error);
      return [];
    }
  },
  
  // Save wishlist items to localStorage
  saveWishlistItems: (items: WishlistItem[]): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('wishlist', JSON.stringify(items));
      localStorage.setItem('wishlist_updated', Date.now().toString());
      
      // Trigger storage event for other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'wishlist',
        newValue: JSON.stringify(items),
        storageArea: localStorage
      }));
      
      // Also dispatch a custom event for components that don't listen to storage
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  },
  
  // Check if a product is in the wishlist
  isInWishlist: (productId: string): boolean => {
    const wishlist = WishlistService.getWishlistItems();
    return wishlist.some(item => item.productId === productId);
  },
  
  // Add item to wishlist
  addItem: (item: WishlistItem): void => {
    // Don't add if already in wishlist
    if (WishlistService.isInWishlist(item.productId)) return;
    
    const wishlist = WishlistService.getWishlistItems();
    wishlist.push({
      ...item,
      addedAt: new Date().toISOString()
    });
    
    WishlistService.saveWishlistItems(wishlist);
  },
  
  // Remove item from wishlist
  removeItem: (productId: string): void => {
    const wishlist = WishlistService.getWishlistItems();
    const updatedWishlist = wishlist.filter(item => item.productId !== productId);
    
    WishlistService.saveWishlistItems(updatedWishlist);
  },
  
  // Toggle item in wishlist (add if not present, remove if present)
  toggleItem: (item: WishlistItem): boolean => {
    const isInWishlist = WishlistService.isInWishlist(item.productId);
    
    if (isInWishlist) {
      WishlistService.removeItem(item.productId);
    } else {
      WishlistService.addItem(item);
    }
    
    return !isInWishlist; // Return new state
  },
  
  // Clear wishlist
  clearWishlist: (): void => {
    WishlistService.saveWishlistItems([]);
  },
  
  // Sync wishlist with server (for logged-in users)
  syncWithServer: async (isAuthenticated: boolean): Promise<void> => {
    if (!isAuthenticated) return;
    
    try {
      // Get current local wishlist
      const localWishlist = WishlistService.getWishlistItems();
      
      // If no local items, try to get wishlist from server
      if (localWishlist.length === 0) {
        const response = await fetch('/api/wishlist', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.wishlist && data.wishlist.items && data.wishlist.items.length > 0) {
            // Save server wishlist to localStorage
            WishlistService.saveWishlistItems(data.wishlist.items);
          }
        }
      } else {
        // For each local item, ensure it's on the server
        for (const item of localWishlist) {
          await fetch('/api/wishlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ productId: item.productId }),
            credentials: 'include'
          });
        }
      }
    } catch (error) {
      console.error('Error syncing wishlist with server:', error);
    }
  },
  
  // Handle user login
  handleLogin: async (): Promise<void> => {
    try {
      // Keep the local wishlist items when user logs in
      // They will be synced to the server by syncWithServer
    } catch (error) {
      console.error('Error handling login for wishlist:', error);
    }
  },
  
  // Handle user logout
  handleLogout: (): void => {
    // Clear wishlist on logout since it's user-specific
    WishlistService.clearWishlist();
  }
};

// Hook for wishlist management
export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadWishlist = () => {
      const wishlistItems = WishlistService.getWishlistItems();
      setItems(wishlistItems);
      setLoading(false);
    };
    
    loadWishlist();
    
    // Listen for wishlist updates
    window.addEventListener('storage', loadWishlist);
    window.addEventListener('wishlist-updated', loadWishlist);
    window.addEventListener('auth_change', loadWishlist);
    
    return () => {
      window.removeEventListener('storage', loadWishlist);
      window.removeEventListener('wishlist-updated', loadWishlist);
      window.removeEventListener('auth_change', loadWishlist);
    };
  }, []);

  return {
    items,
    loading,
    isInWishlist: (productId: string) => WishlistService.isInWishlist(productId),
    addItem: (item: WishlistItem) => {
      WishlistService.addItem(item);
      setItems(WishlistService.getWishlistItems());
    },
    removeItem: (productId: string) => {
      WishlistService.removeItem(productId);
      setItems(WishlistService.getWishlistItems());
    },
    toggleItem: (item: WishlistItem) => {
      const newState = WishlistService.toggleItem(item);
      setItems(WishlistService.getWishlistItems());
      return newState;
    },
    clearWishlist: () => {
      WishlistService.clearWishlist();
      setItems([]);
    }
  };
} 