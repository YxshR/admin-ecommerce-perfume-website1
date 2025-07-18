/** @type {import('next').NextConfig} */
// Load environment variables from .env.development in development mode
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '.env.development' });
}

const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Disable source maps in production to reduce bundle size
  productionBrowserSourceMaps: false,
  // Add environment variables that are safe to expose to the client
  // Do NOT include sensitive information here - use .env.local for those
  env: {
    GOOGLE_STORAGE_BUCKET_NAME: process.env.GOOGLE_STORAGE_BUCKET_NAME || 'ecommerce-app-444531.appspot.com',
    GOOGLE_STORAGE_PROJECT_ID: process.env.GOOGLE_STORAGE_PROJECT_ID || 'ecommerce-app-444531',
    // Removed sensitive information - these should be loaded from .env.local only
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV || 'production',
    // Add JWT_SECRET and ADMIN_JWT_SECRET for development only
    ...(process.env.NODE_ENV === 'development' ? {
      JWT_SECRET: process.env.JWT_SECRET || 'development-jwt-secret-key-for-testing',
      ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || 'development-admin-jwt-secret-key-for-testing',
    } : {}),
  },
  output: 'standalone',
  // Add experimental features to improve compatibility with Vercel deployments
  experimental: {
    optimizePackageImports: ['react-icons'],
    optimizeCss: true,
  },
  serverExternalPackages: [],
  // Handle Node.js modules in webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
      };
    }
    return config;
  },
  async redirects() {
    // Skip admin redirects in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return [
      // Main domain redirects
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'avitoluxury.in',
          }
        ],
        destination: 'https://avitoluxury.in/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.avitoluxury.in',
          }
        ],
        destination: 'https://avitoluxury.in/:path*',
        permanent: true,
      },
      
      // Admin subdomain redirects (only in production)
      ...(!isDevelopment ? [
        {
          source: '/admin/:path*',
          has: [
            {
              type: 'host',
              value: 'avitoluxury.in',
            }
          ],
          destination: 'https://admin.avitoluxury.in/admin/:path*',
          permanent: true,
        },
        {
          source: '/admin/:path*',
          has: [
            {
              type: 'host',
              value: 'www.avitoluxury.in',
            }
          ],
          destination: 'https://admin.avitoluxury.in/admin/:path*',
          permanent: true,
        }
      ] : []),
      
      // Store route redirects
      {
        source: '/store',
        destination: '/store-routes/store',
        permanent: true,
      },
      {
        source: '/store/:path*',
        destination: '/store-routes/store/:path*',
        permanent: true,
      },
      {
        source: '/product/:path*',
        destination: '/store-routes/product/:path*',
        permanent: true,
      }
    ]
  }
};

module.exports = nextConfig; 