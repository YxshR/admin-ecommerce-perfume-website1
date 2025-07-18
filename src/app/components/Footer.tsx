'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import Image from 'next/image';

export default function Footer() {
  const { isAuthenticated } = useAuth();
  
  return (
    <footer className="bg-white border-t border-gray-200 pt-4 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8  items-start">
          {/* Logo and Story Section */}
          <div className="col-span-1 flex flex-col items-center md:items-start">
            <div className="mb-6 w-full text-center md:text-left">
              {/* Logo */}
              <div className="flex justify-center md:justify-start">
                <Image 
                  src="/avito3-13.png" 
                  alt="A V I T O   S C E N T S Logo" 
                  width={150}
                  height={60}
                  className="mb-4"
                  style={{ width: '80%', height: 'auto' }}
                />
              </div>
              {/* Our Story */}
              <h3 className="text-lg font-medium mb-2">Our Story</h3>
              <p className="text-sm text-gray-600">
                AVITO Perfume was created to make luxury fragrances accessible to everyone in India. 
                The goal was simple—high-quality, long-lasting scents at a fair price.
              </p>

              <p className="text-sm text-gray-600 mt-2">
                Today, AVITO offers a diverse range of perfumes for all genders—crafted with care, 
                inspired by the world, and made for everyday elegance.
              </p>
            </div>
          </div>
          
          {/* Policies Section - Centered */}
          <div className="col-span-1 flex flex-col items-center">
            <h3 className="text-lg font-medium mb-4">Policies</h3>
            <ul className="space-y-2 text-center">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-black text-sm">
                  Contact Information
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-gray-600 hover:text-black text-sm">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-black text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-gray-600 hover:text-black text-sm">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-600 hover:text-black text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Stay Connected Section - Kept unchanged */}
          <div className="col-span-1">
            <h3 className="text-lg font-medium mb-4">Stay Connected</h3>
            <p className="text-sm text-gray-600 mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="flex mb-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black flex-grow text-sm"
              />
              <button className="bg-black text-white px-4 py-2 text-sm">
                Subscribe
              </button>
            </div>
            <div className="flex flex-col space-y-3 mt-4">
              <div className="flex items-center">
                <a href="https://www.instagram.com/avitoscents?igsh=M2E0bG5yNnNhNm11" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-black flex items-center"
                >
                  <FaInstagram className="h-6 w-6 mr-2" />
                  <span className="text-sm">Instagram</span>
                </a>
              </div>
              <div className="flex items-center">
                <a href="https://www.facebook.com/profile.php?id=61576015962692&mibextid=ZbWKwL" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-black flex items-center"
                >
                  <FaFacebook className="h-6 w-6 mr-2" />
                  <span className="text-sm">Facebook</span>
                </a>
              </div>
              <div className="flex items-center">
                <a href="https://wa.me/919928200900" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-black flex items-center"
                >
                  <FaWhatsapp className="h-6 w-6 mr-2" />
                  <span className="text-sm">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright at the bottom center */}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex flex-col items-center">
            <p className="text-lg font-bold bg-gradient-to-r from-pink-500 via-yellow-400 to-red-500 bg-clip-text text-transparent drop-shadow-md tracking-wide mb-1 animate-pulse">Crafted in France, Bottled in India</p>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} A V I T O   S C E N T S. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 