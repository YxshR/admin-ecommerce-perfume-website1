# Avito Scent Perfume E-commerce Website

This is a full-stack e-commerce website for selling perfumes. It includes both an admin dashboard and a customer-facing store.

## Features

- **Admin Panel**: Manage products, orders, users, and website content
- **E-commerce Store**: Browse products, add to cart, checkout
- **User Authentication**: Login, signup, and profile management
- **Order Management**: Track orders, view history
- **Wishlist**: Save favorite products
- **MongoDB Integration**: All data stored in MongoDB database

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database (Atlas or local)
- Cloudinary account (for image uploads)

### Quick Setup (Recommended)

The simplest way to get started is using our setup script:

```
npm run setup
```

This script will:
1. Create an `.env.local` file template if it doesn't exist
2. Prompt you to edit it with your actual credentials
3. Install dependencies if needed
4. Ask if you want to seed the database
5. Start the development server

### Manual Installation

If you prefer to set up manually:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/perfume-ecommerce.git
   cd perfume-ecommerce
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create environment variables:
   ```
   node create-env-local.js
   ```

4. Edit the `.env.local` file with your actual credentials:
   - Add your MongoDB connection string
   - Set JWT secrets
   - Add Cloudinary credentials

5. Seed the database with initial data:
   ```
   npm run seed
   ```

6. Run the development server:
   ```
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Admin Login

- Email: admin@example.com
- Password: admin123

### Default User Login

- Email: user@example.com
- Password: user123

## Project Structure

- `/src/app`: Main application code
  - `/api`: API routes
  - `/admin`: Admin panel pages
  - `/store-routes`: Customer-facing store pages
  - `/components`: Reusable React components
  - `/lib`: Utility functions
  - `/models`: MongoDB models
- `/scripts`: Database scripts and utilities
- `/public`: Static assets

## Technologies Used

- Next.js
- React
- MongoDB with Mongoose
- Tailwind CSS
- JWT Authentication
- Cloudinary (for image storage)

## License

This project is licensed under the MIT License.

## Live Link : https://admin-ecommerce-perfume-website1.vercel.app/
