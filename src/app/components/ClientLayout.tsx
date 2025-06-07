'use client';

import { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Show the button after scrolling down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowWhatsApp(true);
      } else {
        setShowWhatsApp(false);
        setShowTooltip(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Auto-hide tooltip after some time
  useEffect(() => {
    let tooltipTimer: NodeJS.Timeout;
    if (showWhatsApp && !showTooltip) {
      tooltipTimer = setTimeout(() => {
        setShowTooltip(true);
      }, 2000);
      
      // Auto hide after 8 seconds
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 10000);
      
      return () => {
        clearTimeout(tooltipTimer);
        clearTimeout(hideTimer);
      };
    }
    return () => {};
  }, [showWhatsApp, showTooltip]);
  
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/919928200900', '_blank');
  };
  
  return (
    <>
      {children}
      
      {/* WhatsApp Button */}
      {showWhatsApp && (
        <div className="fixed bottom-6 right-6 z-50">
          {showTooltip && (
            <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-3 mb-2 w-64 animate-fade-in">
              <button 
                onClick={() => setShowTooltip(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                aria-label="Close tooltip"
              >
                <IoClose size={16} />
              </button>
              <p className="text-sm font-medium">Need help with your order?</p>
              <p className="text-xs text-gray-600 mt-1">Chat with us on WhatsApp for quick assistance!</p>
            </div>
          )}
          
          <button
            onClick={handleWhatsAppClick}
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="Contact via WhatsApp"
          >
            <FaWhatsapp size={28} />
          </button>
        </div>
      )}
    </>
  );
} 