# Environment Setup Guide

This document provides instructions for setting up the environment variables required for this application.

## MongoDB Connection Setup

The application requires a MongoDB connection to function properly. If you're experiencing errors related to MongoDB connection, follow these steps:

### Option 1: Using the Connection Checker Script (Recommended)

We've created a script to help you test and troubleshoot your MongoDB connection:

1. Run the script:
   ```
   node check-mongodb-connection.js
   ```

2. Follow the prompts to test your current connection or enter a new MongoDB connection string.

3. The script will automatically update your `.env.local` file with the working connection string.

### Option 2: Manual Setup

1. Create a `.env.local` file in the root directory of the project if it doesn't exist.

2. Add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

3. Replace `username`, `password`, `cluster`, and `database` with your actual MongoDB credentials.

4. Test the connection:
   ```
   node test-mongodb-connection.js
   ```

## Common MongoDB Connection Issues

### ENOTFOUND Error

If you see an error like `getaddrinfo ENOTFOUND ac-7etgt4l-shard-00-01.667mr8b.mongodb.net`, it means the hostname in your MongoDB connection string cannot be resolved.

**Solutions:**
- Check for typos in your MongoDB connection string
- Make sure you're using the correct cluster address
- Verify your internet connection

### Authentication Failed

If you see an error related to authentication:

**Solutions:**
- Verify your username and password in the connection string
- Check if the user has the correct permissions in MongoDB

### Other Required Environment Variables

Besides MongoDB, make sure you have the following environment variables set in your `.env.local` file:

```
# JWT Secrets
JWT_SECRET=your-jwt-secret-key-change-this-in-production
ADMIN_JWT_SECRET=your-admin-jwt-secret-key-change-this-in-production

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email service
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=465
EMAIL_USER=info@avitoluxury.in
EMAIL_PASSWORD=your-email-password
EMAIL_RECIPIENT=your-email@example.com

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cron Secret
CRON_SECRET=development-secret
```

## Testing Your Setup

After setting up your environment variables, you can test if everything is working correctly:

1. Test MongoDB connection:
   ```
   node test-mongodb-connection.js
   ```

2. Start the development server:
   ```
   npm run dev
   ```

If you encounter any issues, please check the console for error messages and refer to the troubleshooting tips in this guide.
