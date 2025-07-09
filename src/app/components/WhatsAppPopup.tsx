'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

interface WhatsAppPopupProps {
  phoneNumber: string;
  message?: string;
}

export default function WhatsAppPopup({ phoneNumber, message = 'Hello, I have a question about your products.' }: WhatsAppPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  
  // Don't show on checkout, cart, payment or order confirmation pages
  const isCheckoutOrCartPage = pathname?.includes('/checkout') || 
                              pathname?.includes('/cart') ||
                              pathname?.includes('/payment') ||
                              pathname?.includes('/order-confirmation');
  
  useEffect(() => {
    // Don't show on checkout/cart pages
    if (isCheckoutOrCartPage) {
      setIsVisible(false);
      return;
    }
    
    // Check if the popup has been closed in this session
    const popupClosed = sessionStorage.getItem('whatsapp_popup_closed');
    
    if (!popupClosed) {
      // Show popup after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isCheckoutOrCartPage]); // Re-run if pathname changes
  
  const closePopup = () => {
    setIsVisible(false);
    // Store in session storage that popup was closed
    sessionStorage.setItem('whatsapp_popup_closed', 'true');
  };
  
  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    closePopup();
  };
  
  if (!isVisible || isCheckoutOrCartPage) return null;
  
  return (
    // <div 
    //   className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50 border border-gray-200"
    //   onClick={(e) => e.stopPropagation()}
    // >
    //   <div className="flex justify-between items-center mb-3">
    //     <div className="flex items-center">
    //       <FaWhatsapp className="text-green-500 text-2xl mr-2" />
    //       <h3 className="font-medium">Chat with us</h3>
    //     </div>
    //     <button 
    //       onClick={closePopup}
    //       className="text-gray-500 hover:text-gray-700"
    //     >
    //       <FiX size={20} />
    //     </button>
    //   </div>
      
    //   <p className="text-sm text-gray-600 mb-4">
    //     Have questions about our products? Chat with our team on WhatsApp for quick assistance!
    //   </p>
      
    //   <button
    //     onClick={openWhatsApp}
    //     className="w-full bg-green-500 text-white py-2 px-4 rounded-md flex items-center justify-center hover:bg-green-600"
    //   >
    //     <FaWhatsapp className="mr-2" />
    //     Chat on WhatsApp
    //   </button>
    // </div>
    <div></div>
  );
} 