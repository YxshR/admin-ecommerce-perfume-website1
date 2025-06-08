'use client';

import React, { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  
  // Show the button after scrolling down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowWhatsApp(true);
      } else {
        setShowWhatsApp(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/919928200900', '_blank');
  };
  
  return (
    <>
      {children}
      
      {/* WhatsApp Button */}
      {showWhatsApp && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleWhatsAppClick}
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg"
            aria-label="Contact via WhatsApp"
          >
            <FaWhatsapp size={28} />
          </button>
        </div>
      )}
    </>
  );
} 