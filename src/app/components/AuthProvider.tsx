'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CartService } from '@/app/services/CartService';
import { WishlistService } from '@/app/services/WishlistService';

interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, redirectPath?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper to check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Secure logging function that only logs in development mode
const secureLog = (message: string, data?: any) => {
  if (!isProduction) {
    if (data) {
      console.log(`[DEV] ${message}`, data);
    } else {
      console.log(`[DEV] ${message}`);
    }
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Function to check authentication status
  const checkAuth = () => {
    try {
      // Check for client-side cookie indicator
      const loginStatus = document.cookie
        .split('; ')
        .find(row => row.startsWith('isLoggedIn='))
        ?.split('=')[1];
      
      if (loginStatus) {
        // Get user data from cookie
        const userDataCookieMatch = document.cookie
          .split('; ')
          .find(row => row.startsWith('userData='));
        
        if (userDataCookieMatch) {
          try {
            // Extract and decode the cookie value properly
            const cookieValue = userDataCookieMatch.split('=')[1];
            const decodedValue = decodeURIComponent(cookieValue);
            const userData = JSON.parse(decodedValue);
            
            secureLog('Auth check: User authenticated');
            setUser(userData);
            
            // Sync cart and wishlist with server
            CartService.syncWithServer(true);
            WishlistService.syncWithServer(true);
          } catch (parseError) {
            secureLog('Auth error: Failed to parse user data');
            console.error('Auth parse error details:', parseError);
            setUser(null);
          }
        } else {
          secureLog('Auth check: No user data found');
          setUser(null);
        }
      } else {
        secureLog('Auth check: Not logged in');
        setUser(null);
      }
    } catch (error) {
      secureLog('Auth error: Error checking authentication');
      console.error('Auth check error details:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check authentication status when component mounts
  useEffect(() => {
    checkAuth();
    
    // Listen for storage events to handle logout in other tabs
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);
  
  // Re-check auth status when route changes
  useEffect(() => {
    secureLog('Route changed, re-checking auth status');
    checkAuth();
  }, [pathname]);
  
  // Login function
  const login = async (email: string, password: string, redirectPath?: string) => {
    try {
      setIsLoading(true);
      secureLog('Login attempt initiated');
      
      // Use window.location to get the exact current URL base
      // This ensures we're using whatever port the page is currently on
      const baseUrl = window.location.origin;
      const timestamp = Date.now();
      const apiUrl = `${baseUrl}/api/auth/login?_=${timestamp}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for cookies
        cache: 'no-store'
      });
      
      if (!response.ok) {
        secureLog('Login API error');
        let errorMessage = 'Login failed';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          secureLog('Failed to parse error response');
        }
        
        return { success: false, error: errorMessage };
      }
      
      const data = await response.json();
      
      if (data.success) {
        secureLog('Login successful');
        
        // Immediately update the user state after successful login
        setUser(data.user);
        
        // Handle cart and wishlist for the logged-in user
        await CartService.handleLogin();
        await WishlistService.handleLogin();
        
        // Sync with server (send localStorage data to server)
        await CartService.syncWithServer(true);
        await WishlistService.syncWithServer(true);
        
        // Trigger a storage event to ensure all tabs are updated
        window.localStorage.setItem('auth_timestamp', Date.now().toString());
        
        // Dispatch custom event for cart refresh
        window.dispatchEvent(new Event('auth_change'));
        
        // Directly call checkAuth to ensure state is updated immediately
        checkAuth();
        
        // Handle redirect logic in this order:
        // 1. Use explicitly provided redirectPath (from function parameter)
        // 2. Use URL query parameter redirect
        // 3. Default based on role
        
        // First check for explicitly provided redirect path
        if (redirectPath) {
          secureLog('Redirecting user after login');
          router.push(redirectPath);
        } else {
          // Check URL parameter
          const urlRedirect = searchParams?.get('redirect');
          if (urlRedirect) {
            secureLog('Redirecting user after login');
            router.push(urlRedirect);
          } else {
            // Default redirect based on role
            if (data.user.role === 'admin') {
              secureLog('Redirecting admin after login');
              router.push('/admin/dashboard');
            } else {
              secureLog('Redirecting user after login');
              router.push('/account');
            }
          }
        }
        
        return { success: true };
      } else {
        secureLog('Login failed');
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      secureLog('Login error occurred');
      console.error('Login error details:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      secureLog('Logout initiated');
      setIsLoading(true);
      
      // Call the logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Cache-Control': 'no-cache' },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Logout API call failed');
      }
      
      // Clear user data
      setUser(null);
      
      // Handle cart and wishlist for logged-out user
      CartService.handleLogout();
      WishlistService.handleLogout();
      
      // Trigger a storage event to ensure all tabs are updated
      window.localStorage.setItem('auth_timestamp', Date.now().toString());
      
      // Dispatch custom event for cart refresh
      window.dispatchEvent(new Event('auth_change'));
      
      // Redirect to home page
      router.push('/');
      
      secureLog('Logout successful');
    } catch (error) {
      secureLog('Logout error occurred');
      console.error('Logout error details:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 