import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from './src/app/lib/auth-utils';

// Protected paths that require authentication
const protectedPaths = [
  '/account',
  '/account/wishlist',
  '/account/orders'
];

// Admin-only paths
// const adminPaths = [
//   '/admin/dashboard',
//   '/admin/products',
//   '/admin/orders',
//   '/admin/users',
//   '/admin/contacts',
// ];

// Protect all /admin pages and subpages
const adminBasePath = '/admin';

// Paths that should always be accessible
const publicPaths = [
  '/admin/login',
  '/login',
  '/register'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and certain API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('favicon') ||
    pathname.includes('.') ||
    publicPaths.some(path => pathname === path)
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Get session from cookies for protected routes
  if (
    pathname.startsWith(adminBasePath) || 
    protectedPaths.some(path => pathname.startsWith(path))
  ) {
    const session = await getSessionFromRequest(request);

    // Check if the path is admin-only
    const isAdminPath = pathname.startsWith(adminBasePath);

    // Check if the path is protected
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    // If path is admin-only and user is not an admin, redirect to admin login
    if (isAdminPath && (!session || session.role !== 'admin')) {
      return applySecurityHeaders(NextResponse.redirect(new URL('/admin/login', request.url)));
    }

    // If path is protected and user is not authenticated, redirect to login
    if (isProtectedPath && !session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Get response for the request
  const response = NextResponse.next({
    request: {
      // Apply new request headers
      headers: requestHeaders,
    }
  });
  
  // Add security headers to prevent data leakage
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), camera=()');
  
  // Add Content-Security-Policy to prevent console logging exploits
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; " +
    "connect-src 'self' https://*.cloudinary.com https://*.razorpay.com; " +
    "img-src 'self' data: blob: https://*.cloudinary.com https://placehold.co https://storage.googleapis.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "font-src 'self' data:; " +
    "frame-src 'self' https://checkout.razorpay.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "report-uri /api/csp-report;"
  );
  
  // Return response
  return response;
}

// Helper function to get session from request
async function getSessionFromRequest(request: NextRequest) {
  try {
    // First try to get token from cookie - check both admin_token and regular token
    const adminToken = request.cookies.get('admin_token')?.value;
    const regularToken = request.cookies.get('token')?.value;
    const token = adminToken || regularToken;
    
    // If no token in cookie, check authorization header
    const authToken = token || request.headers.get('authorization')?.split(' ')[1] || null;
    
    // If no token found, return null
    if (!authToken) {
      return null;
    }
    
    // Decrypt and verify the token
    const payload = await decrypt(authToken);
    if (!payload) {
      return null;
    }
    
    // Return user info from payload
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role
    };
  } catch (error) {
    // Silent error handling for security
    return null;
  }
}

// Helper function to apply security headers to any response
function applySecurityHeaders(response: NextResponse) {
  // Add security headers
  const securityHeaders = {
    // Content Security Policy to prevent XSS attacks and console exploits
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self'; img-src 'self' data: blob: https://*.cloudinary.com; style-src 'self' 'unsafe-inline'; font-src 'self';"
  };

  // Apply all security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Define which paths this middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except API routes and static files
    '/((?!api|_next/static|_next/image|_next/webpack|favicon.ico).*)',
  ],
}; 