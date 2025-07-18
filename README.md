# A V I T O   S C E N T S E-commerce Website

## Overview
This is an e-commerce website for A V I T O   S C E N T S, a premium perfume brand. The website allows users to browse products, add them to cart, and complete purchases without requiring login or signup.

## Features

- Full-featured admin dashboard
- Product management with image uploads
- Order management and tracking
- Customer database
- OTP-based checkout flow using 2Factor SMS
- Secure admin authentication
- Responsive design for all devices

## Tech Stack

- Next.js 15 with App Router
- React 19
- TypeScript
- MongoDB with Mongoose
- Tailwind CSS
- Google Cloud Storage for image uploads
- Cloudinary for image optimization
- 2Factor for SMS OTP
- Razorpay for payments

## Checkout Flow
The website implements a guest checkout flow with the following steps:
1. User adds products to cart
2. User clicks "Checkout" button
3. Phone number verification with Twilio OTP
4. User enters shipping details (name, email, address)
5. Payment processing with Razorpay
6. Order confirmation

## Key User Flows

1. Admin authentication with secure login
2. Product management (add, edit, delete)
3. Phone number verification with 2Factor OTP
4. Order management and fulfillment

## Prerequisites

- Node.js 20.x or higher
- MongoDB database
- Google Cloud Storage account
- Cloudinary account
- 2Factor account for SMS OTP
- Razorpay account for payments

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env.local` file with required environment variables
4. Set up 2Factor credentials (see 2FACTOR-ENV-SETUP.md)
5. Run the development server with `npm run dev`

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
