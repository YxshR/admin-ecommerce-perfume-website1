'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiBox, FiShoppingBag, FiUsers, FiLogOut, FiSettings, FiSave, FiPlusCircle, FiImage, FiVideo, FiX, FiArrowUp, FiArrowDown, FiMail } from 'react-icons/fi';
import AdminLayout from '@/app/components/AdminLayout';
import { useAdminAuth, getAdminToken } from '@/app/lib/admin-auth';

// Define product type
interface ProductMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  file?: File;
  preview?: string;
}

interface ProductData {
  name: string;
  productType: string;
  category: string;
  subCategories: string[];
  gender: string;
  volume: string;
  price: number;
  comparePrice?: number;
  description: string;
  about: string;
  disclaimer: string;
  media: ProductMedia[];
  featured: boolean;
  inStock: boolean;
  quantity: number;
  sku: string;
  brand: string;
  slug: string;
  bestSelling: boolean;
  newArrivals: boolean;
  bestBuy: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  
  const { isAuthenticated, user, loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [notFound, setNotFound] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Product form state
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    productType: '',
    category: '',
    subCategories: [],
    gender: '',
    volume: '',
    price: 0,
    comparePrice: 0,
    description: '',
    about: '',
    disclaimer: '',
    media: [],
    featured: false,
    inStock: true,
    quantity: 0,
    sku: '',
    brand: '',
    slug: '',
    bestSelling: false,
    newArrivals: false,
    bestBuy: false
  });
  
  // Product type options
  const productTypeOptions = [
    'Perfumes',
    'Aesthetic Attars',
    'Air Fresheners',
    'Waxfume (Solid)'
  ];
  
  // Dynamic category options based on product type
  const getCategoryOptions = () => {
    switch(productData.productType) {
      case 'Perfumes':
        return ['Value for Money', 'Premium Perfumes', 'Luxury Perfumes', 'Combo Sets'];
      case 'Aesthetic Attars':
        return ['Premium Attars', 'Luxury Attars', 'Combo Sets'];
      case 'Air Fresheners':
        return ['Room Fresheners', 'Car Diffusers'];
      case 'Waxfume (Solid)':
        return ['Tin Zar'];
      default:
        return [];
    }
  };
  
  // Dynamic sub-category options based on product type and category
  const getSubCategoryOptions = () => {
    if (!productData.productType || !productData.category) return [];
    
    switch(productData.productType) {
      case 'Perfumes':
        switch(productData.category) {
          case 'Value for Money':
            return ['Peach', 'Sea Musk'];
          case 'Premium Perfumes':
            return ['Founder', 'Nectar'];
          case 'Luxury Perfumes':
            return ['Brise DavrilI'];
          case 'Combo Sets':
            return [
              'Two 20 ml Set Combo Woman (Peach/Breeze)',
              'Four 20 ml Set Combo Unisex (Founder, Nectar, Sea Musk, Peach)',
              'Two 20 ml Combo Set MAN (Brise Davril, Nectar)',
              'Two 20 ml Combo Set COUPLE (Brise DavrilI, Peach)'
            ];
          default:
            return [];
        }
      case 'Aesthetic Attars':
        switch(productData.category) {
          case 'Premium Attars':
            return ['Rose', 'Amber', 'Sandalwood', 'Kewra', 'Green Khus', 'Coffee'];
          case 'Luxury Attars':
            return ['Royal Blue', 'Blue Lomani', 'La Flora', 'Arabian OUD', 'Caramal'];
          case 'Combo Sets':
            return [
              'Daily Officer Wear (Rose, Roayl Blue, Arabian OUD)',
              'Party Wear (Musk Rose, Amber, La Flora)',
              'Gift Box (Rose, Caramal, Blue Lomani)'
            ];
          default:
            return [];
        }
      case 'Air Fresheners':
        return ['Lavender', 'Chandan', 'Gulab', 'Lemon', 'Musk', 'Vanila'];
      case 'Waxfume (Solid)':
        return ['Tin Zar'];
      default:
        return [];
    }
  };
  
  // Dynamic volume options based on product type
  const getVolumeOptions = () => {
    switch(productData.productType) {
      case 'Perfumes':
        return ['20ml', '50ml', '100ml'];
      case 'Aesthetic Attars':
        return ['5ml', '8ml', '10ml'];
      case 'Air Fresheners':
        return ['10ml', '250ml'];
      case 'Waxfume (Solid)':
        return ['10gms', '25gms'];
      default:
        return [];
    }
  };
  
  // Gender options
  const genderOptions = ['Him', 'Her', 'Unisex'];
  
  // Fetch product data when component mounts
  useEffect(() => {
    if (productId && !authLoading && isAuthenticated) {
      fetchProductData();
    }
  }, [productId, authLoading, isAuthenticated]);
  
  // Function to fetch product data with retry mechanism
  const fetchProductData = async (retryCount = 0) => {
    setLoading(true);
    setSaveError('');
    try {
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true);
          throw new Error('Product not found');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch product: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.product) {
        // Format category as an array if it's a string
        let categoryArray = [];
        if (typeof data.product.category === 'string') {
          categoryArray = data.product.category.split(',').map((cat: string) => cat.trim());
        } else if (Array.isArray(data.product.category)) {
          categoryArray = data.product.category;
        }
        
        // Determine product type based on category
        let productType = 'Perfumes'; // Default
        let category = '';
        let subCategories: string[] = [];
        
        // Try to extract product type and category from the existing data
        if (categoryArray.includes('Car Diffuser') || categoryArray.includes('Room Spray')) {
          productType = 'Air Fresheners';
          category = categoryArray.includes('Car Diffuser') ? 'Car Diffusers' : 'Room Fresheners';
        } else if (categoryArray.includes('Attar')) {
          productType = 'Aesthetic Attars';
          if (categoryArray.includes('Luxury')) {
            category = 'Luxury Attars';
          } else {
            category = 'Premium Attars';
          }
        } else if (categoryArray.includes('Waxfume')) {
          productType = 'Waxfume (Solid)';
          category = 'Tin Zar';
        } else {
          // For perfumes, try to determine the category
          if (categoryArray.includes('Luxury')) {
            category = 'Luxury Perfumes';
          } else if (categoryArray.includes('Premium')) {
            category = 'Premium Perfumes';
          } else if (categoryArray.includes('Bestseller')) {
            category = 'Value for Money';
          } else {
            category = 'Value for Money'; // Default
          }
        }
        
        // Transform the product data to match our form state
        setProductData({
          name: data.product.name || '',
          slug: data.product.slug || '',
          productType,
          category,
          subCategories,
          gender: data.product.attributes?.gender || '',
          volume: data.product.attributes?.volume || '',
          price: data.product.price || 0,
          comparePrice: data.product.comparePrice || 0,
          description: data.product.description || '',
          about: data.product.attributes?.about || '',
          disclaimer: data.product.attributes?.disclaimer || '',
          media: data.product.images ? data.product.images.map((url: string, index: number) => ({
            id: `existing-${index}`,
            type: 'image',
            url
          })) : [],
          featured: data.product.featured || false,
          inStock: data.product.quantity > 0,
          quantity: data.product.quantity || 0,
          sku: data.product.sku || '',
          brand: data.product.brand || 'Avito Scent',
          bestSelling: categoryArray.includes('Bestseller'),
          newArrivals: categoryArray.includes('New Arrival'),
          bestBuy: false // Default as we don't have this flag in the old data
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setSaveError('Failed to load product data');
      
      // Retry logic - attempt up to 3 retries
      if (retryCount < 3) {
        console.log(`Retrying fetch product data (${retryCount + 1}/3)...`);
        setTimeout(() => {
          fetchProductData(retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Reset sub-categories when category changes
  useEffect(() => {
    if (!loading) {
      setProductData(prev => ({
        ...prev,
        subCategories: []
      }));
    }
  }, [productData.category, loading]);
  
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // If inStock is toggled, update quantity accordingly
    if (name === 'inStock' && !checked) {
      setProductData(prev => ({
        ...prev,
        quantity: 0
      }));
    }
  };
  
  // Handle sub-category selection
  const handleSubCategoryChange = (subCategory: string) => {
    setProductData(prev => {
      const newSubCategories = prev.subCategories.includes(subCategory) 
        ? prev.subCategories.filter(c => c !== subCategory)
        : [...prev.subCategories, subCategory];
      
      return {
        ...prev,
        subCategories: newSubCategories
      };
    });
  };
  
  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsSaving(true);
    setSaveError('');
    
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'product_images');
      
      // Upload to Google Cloud Storage via our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Add the uploaded image to the product media
        setProductData(prev => ({
          ...prev,
          media: [...prev.media, { 
            type: 'image', 
            url: data.url, 
            id: data.public_id 
          }]
        }));
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setSaveError('Failed to upload image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsSaving(true);
    setSaveError('');
    
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resourceType', 'video');
      formData.append('folder', 'product_videos');
      
      // Upload to Google Cloud Storage via our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Add the uploaded video to the product media
        setProductData(prev => ({
          ...prev,
          media: [...prev.media, { 
            type: 'video', 
            url: data.url, 
            id: data.public_id 
          }]
        }));
      } else {
        throw new Error(data.error || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      setSaveError('Failed to upload video. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle removing media
  const handleRemoveMedia = async (index: number) => {
    const mediaItem = productData.media[index];
    
    if (mediaItem) {
      // If the URL is from Google Cloud Storage, delete it from the server
      if (mediaItem.url.includes('storage.googleapis.com')) {
        try {
          const response = await fetch(`/api/upload?fileId=${encodeURIComponent(mediaItem.id)}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            console.error('Failed to delete media from storage');
          }
        } catch (error) {
          console.error('Error deleting media from storage:', error);
        }
      }
      
      // Remove from product media array
      setProductData(prev => ({
        ...prev,
        media: prev.media.filter((_, i) => i !== index)
      }));
    }
  };
  
  // Move media item up in the list
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    setProductData(prev => {
      const newMedia = [...prev.media];
      const temp = newMedia[index];
      newMedia[index] = newMedia[index - 1];
      newMedia[index - 1] = temp;
      
      return {
        ...prev,
        media: newMedia
      };
    });
  };
  
  // Move media item down in the list
  const handleMoveDown = (index: number) => {
    if (index === productData.media.length - 1) return;
    
    setProductData(prev => {
      const newMedia = [...prev.media];
      const temp = newMedia[index];
      newMedia[index] = newMedia[index + 1];
      newMedia[index + 1] = temp;
      
      return {
        ...prev,
        media: newMedia
      };
    });
  };
  
  // Form validation
  const validateForm = (): string => {
    if (!productData.name.trim()) return 'Product name is required';
    if (!productData.productType) return 'Please select a product type';
    if (!productData.category) return 'Please select a category';
    if (productData.subCategories.length === 0) return 'Please select at least one sub-category';
    if (!productData.gender) return 'Please select a gender';
    if (!productData.volume) return 'Please select product volume';
    if (productData.price <= 0) return 'Price must be greater than 0';
    
    // Check if at least one image is uploaded
    const hasImages = productData.media.some(m => m.type === 'image');
    if (!hasImages) return 'Please add at least one image';
    
    return '';
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const error = validateForm();
    if (error) {
      setSaveError(error);
      return;
    }
    
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    
    try {
      // Create form data for multipart/form-data submission
      const formData = new FormData();
      
      // Prepare the main product info as JSON
      const productInfo = {
        name: productData.name,
        slug: productData.slug || productData.name.toLowerCase().replace(/\s+/g, '-'),
        description: productData.description,
        price: productData.price,
        comparePrice: productData.comparePrice,
        category: productData.category,
        featured: productData.featured,
        isNewProduct: productData.category.includes('New Arrival'),
        quantity: productData.inStock ? productData.quantity : 0,
        sku: productData.sku,
        brand: productData.brand || 'Avito Scent',
        gender: productData.gender,
        volume: productData.volume,
        about: productData.about,
        disclaimer: productData.disclaimer,
        mainImage: productData.media.length > 0 ? productData.media[0].url : ''
      };
      
      // Add product info as JSON
      formData.append('productInfo', JSON.stringify(productInfo));
      
      // Add media files
      productData.media.forEach((media, index) => {
        if (media.file) {
          formData.append(`media_${index}`, media.file);
        }
      });
      
      // Get existing image URLs that don't have files (from server)
      const existingImages = productData.media
        .filter(media => !media.file && media.url.startsWith('http'))
        .map(media => media.url);
      
      // Add existing images as JSON
      formData.append('existingImages', JSON.stringify(existingImages));
      
      // Send PUT request to update product
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSaveSuccess(true);
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/admin/products');
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setSaveError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout activeRoute="/admin/products">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update product information</p>
          </div>
          <Link 
            href="/admin/products" 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Back to Products
          </Link>
        </div>
        
        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            Product updated successfully!
          </div>
        )}
        
        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {saveError}
          </div>
        )}
        
        {notFound ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link 
              href="/admin/products" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Products
            </Link>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Basic Details */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium mb-4">Basic Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={productData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                {/* Product Type */}
                <div>
                  <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="productType"
                    name="productType"
                    value={productData.productType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select product type</option>
                    {productTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {/* Category - Dynamic based on product type */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={productData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!productData.productType}
                  >
                    <option value="">Select category</option>
                    {getCategoryOptions().map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={productData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select gender</option>
                    {genderOptions.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
                
                {/* Volume - Dynamic based on product type */}
                <div>
                  <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-1">
                    Volume <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="volume"
                    name="volume"
                    value={productData.volume}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!productData.productType}
                  >
                    <option value="">Select volume</option>
                    {getVolumeOptions().map(volume => (
                      <option key={volume} value={volume}>{volume}</option>
                    ))}
                  </select>
                </div>
                
                {/* Sub-Categories - Dynamic based on product type and category */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub-Categories <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {getSubCategoryOptions().map(subCategory => (
                      <div key={subCategory} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`subCategory-${subCategory}`}
                          checked={productData.subCategories.includes(subCategory)}
                          onChange={() => handleSubCategoryChange(subCategory)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`subCategory-${subCategory}`} className="ml-2 text-sm text-gray-700">
                          {subCategory}
                        </label>
                      </div>
                    ))}
                  </div>
                  {productData.productType && productData.category && getSubCategoryOptions().length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">No sub-categories available for the selected category</p>
                  )}
                </div>
                
                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={productData.price}
                    onChange={handleNumberChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                {/* Compare Price */}
                <div>
                  <label htmlFor="comparePrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Compare Price (₹) <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    id="comparePrice"
                    name="comparePrice"
                    value={productData.comparePrice || ''}
                    onChange={handleNumberChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                
                {/* Marketing Flags */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marketing Flags
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="bestSelling"
                        name="bestSelling"
                        checked={productData.bestSelling}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="bestSelling" className="ml-2 text-sm text-gray-700">
                        Best Selling
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="newArrivals"
                        name="newArrivals"
                        checked={productData.newArrivals}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="newArrivals" className="ml-2 text-sm text-gray-700">
                        New Arrivals
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="bestBuy"
                        name="bestBuy"
                        checked={productData.bestBuy}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="bestBuy" className="ml-2 text-sm text-gray-700">
                        Best Buy
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Status */}
                <div className="col-span-2 flex space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      checked={productData.featured}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                      Featured Product
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="inStock"
                      name="inStock"
                      checked={productData.inStock}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                      In Stock
                    </label>
                  </div>
                </div>

              {/* Quantity Field */}
              <div className="col-span-2">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={productData.quantity}
                  onChange={handleNumberChange}
                  disabled={!productData.inStock}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !productData.inStock ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  min="0"
                  step="1"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  {productData.inStock ? 'Enter the available stock quantity' : 'Enable "In Stock" to set quantity'}
                </p>
              </div>
              </div>
            </div>
            
            {/* Media */}
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium mb-4">Product Images</h2>
              
              {/* Existing media */}
              <div className="mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {productData.media.map((item, index) => (
                    <div key={item.id} className="border rounded-md overflow-hidden relative">
                      {item.type === 'image' ? (
                        <img 
                          src={item.preview || item.url} 
                          alt={`Product media ${index}`}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <video 
                          src={item.preview || item.url}
                          className="w-full h-40 object-cover"
                          controls
                        />
                      )}
                      <div className="absolute top-0 right-0 p-1 flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          className="bg-white rounded-full p-1 text-gray-700 hover:text-black"
                          disabled={index === 0}
                        >
                          <FiArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          className="bg-white rounded-full p-1 text-gray-700 hover:text-black"
                          disabled={index === productData.media.length - 1}
                        >
                          <FiArrowDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(index)}
                          className="bg-white rounded-full p-1 text-red-500 hover:text-red-700"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">
                          Main Image
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Upload buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FiImage className="mr-2" /> Add Images
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FiVideo className="mr-2" /> Add Videos
                </button>
              </div>
              
              {/* Hidden file inputs */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoUpload}
                accept="video/*"
                multiple
                className="hidden"
              />
            </div>
            
            {/* Submit button */}
            <div className="p-6 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSaving ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
} 