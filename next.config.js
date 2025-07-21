/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing configuration
  images: {
    domains: ['res.cloudinary.com'],
  },
  // Server packages configuration
  serverExternalPackages: ['node-cron'],
  // Skip TypeScript checks during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure server code is included in the build
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add src/server directory to server build
      config.externals = [...config.externals, 'node-cron'];
    }
    return config;
  },
}

module.exports = nextConfig 