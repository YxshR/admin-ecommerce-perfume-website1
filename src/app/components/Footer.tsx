'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const { isAuthenticated } = useAuth();
  
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-black text-sm">
                  Contact Us
                </Link>
              </li>
              {/* {isAuthenticated && (
                <li>
                  <Link href="/track-order" className="text-gray-600 hover:text-black text-sm">
                    Track Order
                  </Link>
                </li>
              )}
              <li>
                <Link href="/shipping-policy" className="text-gray-600 hover:text-black text-sm">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-black text-sm">
                  Returns & Exchanges
                </Link>
              </li> */}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about-us" className="text-gray-600 hover:text-black text-sm">
                  Our Story
                </Link>
              </li>
              {/* <li>
                <Link href="/sustainability" className="text-gray-600 hover:text-black text-sm">
                  Sustainability
                </Link>
              </li> */}
              {/* <li>
                <Link href="/careers" className="text-gray-600 hover:text-black text-sm">
                  Careers
                </Link>
              </li> */}
              {/* <li>
                <Link href="/store-locator" className="text-gray-600 hover:text-black text-sm">
                  Store Locator
                </Link>
              </li> */}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/him" className="text-gray-600 hover:text-black text-sm">
                  For Him
                </Link>
              </li>
              <li>
                <Link href="/her" className="text-gray-600 hover:text-black text-sm">
                  For Her
                </Link>
              </li>
              <li>
                <Link href="/unisex" className="text-gray-600 hover:text-black text-sm">
                  Unisex
                </Link>
              </li>
              {/* <li>
                <Link href="/discovery-set" className="text-gray-600 hover:text-black text-sm">
                  Discovery Sets
                </Link>
              </li> */}
              {/* <li>
                <Link href="/gifting" className="text-gray-600 hover:text-black text-sm">
                  Gift Cards
                </Link>
              </li> */}
            </ul>
          </div>
          
          <div>
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
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Avito Scent. All rights reserved.
              </p>
              
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-black">
                Privacy Policy
              </Link>
              {/* <Link href="/terms-of-service" className="text-sm text-gray-500 hover:text-black">
                Terms of Service
              </Link>
              <Link href="/cookie-policy" className="text-sm text-gray-500 hover:text-black">
                Cookie Policy
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 