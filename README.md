# Avito Scent E-commerce Website

## Overview
This is an e-commerce website for Avito Scent, a premium perfume brand. The website allows users to browse products, add them to cart, and complete purchases without requiring login or signup.

## Features
- Product browsing and searching
- Cart functionality (add, remove, update quantity)
- OTP-based checkout flow using Twilio
- Responsive design for all devices
- Admin panel for order management

## Tech Stack
- Next.js
- React
- MongoDB
- Tailwind CSS
- Twilio for SMS OTP
- Razorpay for payments

## Checkout Flow
The website implements a guest checkout flow with the following steps:
1. User adds products to cart
2. User clicks "Checkout" button
3. Phone number verification with Twilio OTP
4. User enters shipping details (name, email, address)
5. Payment processing with Razorpay
6. Order confirmation

## Setup Instructions

### Prerequisites
- Node.js 14.x or higher
- MongoDB database
- Twilio account for SMS OTP
- Razorpay account for payments

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with the required environment variables (see `.env.local.example`)
4. Set up Twilio credentials (see TWILIO-ENV-SETUP.md)
5. Run the development server:
   ```
   npm run dev
   ```

### Environment Variables
See `.env.local.example` for the required environment variables.

## Admin Panel
The admin panel allows you to:
- View and manage orders
- Manage products
- View customer information

Access the admin panel at `/admin/login`.

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
