// Script to set up temporary environment variables for development
const fs = require('fs');
const path = require('path');

// Create a temporary .env.development file that won't be ignored
const envContent = `# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/perfume-ecommerce

# JWT Secrets
JWT_SECRET=development-jwt-secret-key-for-testing
ADMIN_JWT_SECRET=development-admin-jwt-secret-key-for-testing

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email service (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
`;

const envPath = path.join(__dirname, '.env.development');

try {
  // Create the file with the development content
  fs.writeFileSync(envPath, envContent);
  console.log('.env.development file created successfully!');
  console.log('To use these environment variables, run:');
  console.log('  node -r dotenv/config --env-file=.env.development your-script.js');
  console.log('Or for Next.js development:');
  console.log('  npx cross-env NODE_ENV=development dotenv -e .env.development next dev');
} catch (error) {
  console.error('Error creating .env.development file:', error);
}

// Also update the load-env.js file to load from .env.development
const loadEnvContent = `// Load environment variables from .env files
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
    console.warn(\`  - \${envVar}\`);
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
`;

const loadEnvPath = path.join(__dirname, 'load-env-dev.js');

try {
  // Create the load-env-dev.js file
  fs.writeFileSync(loadEnvPath, loadEnvContent);
  console.log('load-env-dev.js file created successfully!');
} catch (error) {
  console.error('Error creating load-env-dev.js file:', error);
} 