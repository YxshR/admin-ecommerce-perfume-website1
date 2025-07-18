// Load environment variables from .env files
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env.development' });

// Check if critical environment variables are set
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'ADMIN_JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn('⚠️ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.warn(`  - ${envVar}`);
  });
  console.warn('Please check your .env.local or .env.development file.');
} else {
  console.log('✅ All required environment variables are set.');
}

// Export environment variables for use in other modules
module.exports = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};
