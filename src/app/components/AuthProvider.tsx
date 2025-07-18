'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CartService } from '@/app/services/CartService';
// Removed WishlistService import

// Define the shape of the context
interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    userId?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  login: (email: string, password: string, redirectPath?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => ({ success: false, error: 'Not implemented' }),
  logout: async () => {},
  loading: true,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if there's a session cookie
        const response = await fetch('/api/auth/check-session');
        const data = await response.json();
        
        if (data.isLoggedIn) {
          setUser({
            userId: data.userId,
            name: data.name,
            email: data.email,
            role: data.role
          });
          setIsAuthenticated(true);
          
          // Sync cart with server
          CartService.syncWithServer(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string, redirectPath?: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser({
          userId: data.userId,
          name: data.name,
          email: data.email,
          role: data.role
        });
        setIsAuthenticated(true);
        
        // Handle cart for the logged-in user
        await CartService.handleLogin();
        
        // Sync cart with server
        await CartService.syncWithServer(true);
        
        // Handle redirect after successful login
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          // Default redirect to account page instead of store
          router.push('/account');
        }
        
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || 'Login failed',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Handle cart for logged-out user
      CartService.handleLogout();
      // Removed wishlist handling
      
      // Redirect to home page if on a protected route
      if (pathname?.includes('/account')) {
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
} 