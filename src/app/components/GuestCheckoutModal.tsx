'use client';

import { useState, useEffect } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';

interface Address {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface GuestCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onSubmit: (address: Address) => void;
}

export default function GuestCheckoutModal({
  isOpen,
  onClose,
  phone,
  onSubmit
}: GuestCheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Address>({
    fullName: '',
    phone: phone,
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Update phone when prop changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, phone }));
  }, [phone]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit PIN code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Submit the address data
      onSubmit(formData);
      
    } catch (error) {
      console.error('Error submitting address:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Shipping Information</h2>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="fullName" className="block text-sm text-gray-700 mb-1">
                Full Name*
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onClick={(e) => e.stopPropagation()}
                className={`w-full p-2 border rounded-md ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm text-gray-700 mb-1">
                Phone Number*
              </label>
              <div className="flex">
                <div className="flex items-center bg-gray-100 px-3 rounded-l-md border border-r-0 border-gray-300">
                  <span className="text-gray-500">+91</span>
                </div>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={phone}
                  readOnly
                  className="flex-1 p-2 border border-gray-300 rounded-r-md bg-gray-100"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                Email Address*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onClick={(e) => e.stopPropagation()}
                className={`w-full p-2 border rounded-md ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm text-gray-700 mb-1">
                Address*
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onClick={(e) => e.stopPropagation()}
                rows={3}
                className={`w-full p-2 border rounded-md ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm text-gray-700 mb-1">
                  City*
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full p-2 border rounded-md ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm text-gray-700 mb-1">
                  State*
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full p-2 border rounded-md ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.state && (
                  <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="pincode" className="block text-sm text-gray-700 mb-1">
                PIN Code*
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setFormData(prev => ({ ...prev, pincode: value }));
                  if (errors.pincode) {
                    setErrors(prev => ({ ...prev, pincode: '' }));
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                maxLength={6}
                className={`w-full p-2 border rounded-md ${
                  errors.pincode ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.pincode && (
                <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md flex items-center ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {loading && <FiLoader className="animate-spin mr-2" />}
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 