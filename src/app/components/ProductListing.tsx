'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './store/ProductCard';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import Nav from './Nav';
import Footer from './Footer';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  productType: string;
  category: string;
  subCategories?: string[];
  tags?: string[];
  featured?: boolean;
  bestSelling?: boolean;
  newArrivals?: boolean;
  bestBuy?: boolean;
  inStock: boolean;
  quantity?: number;
  createdAt: string;
  updatedAt: string;
  attributes?: {
    volume?: string;
  };
}

interface ProductListingProps {
  productType?: string;
  category?: string;
  subCategory?: string;
  tag?: string;
  title: string;
  description?: string;
}

export default function ProductListing({
  productType,
  category,
  subCategory,
  tag,
  title,
  description
}: ProductListingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([]);
  const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]);
  const [availableVolumes, setAvailableVolumes] = useState<string[]>([]);
  
  // Fetch products based on productType, category, subCategory, or tag
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (productType) params.append('productType', productType);
        if (category) params.append('category', category);
        if (subCategory) params.append('subCategory', subCategory);
        if (tag) params.append('tag', tag);
        
        // Fetch products from API
        const response = await fetch(`/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        // Ensure data is an array of products
        const productsArray: Product[] = Array.isArray(data.products) ? data.products : [];
        setProducts(productsArray);
        
        // Extract unique sub-categories and volumes for filtering
        if (productsArray.length > 0) {
          // Extract sub-categories
          const allSubCategories = productsArray.flatMap(product => product.subCategories || []);
          const uniqueSubCategories = [...new Set(allSubCategories)];
          setAvailableSubCategories(uniqueSubCategories);
          
          // Extract volumes
          const allVolumes = productsArray.map(product => {
            const attributes = product.attributes || {};
            return attributes.volume || '';
          }).filter(Boolean);
          const uniqueVolumes = [...new Set(allVolumes)];
          setAvailableVolumes(uniqueVolumes);
          
          // Find min and max price
          const prices = productsArray.map(product => product.discountedPrice || product.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setPriceRange([minPrice, maxPrice]);
        }
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setProducts([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [productType, category, subCategory, tag]);
  
  // Apply filters and search
  const filteredProducts = products.filter(product => {
    // Filter by search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !product.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by price range
    const price = product.discountedPrice || product.price;
    if (price < priceRange[0] || price > priceRange[1]) {
      return false;
    }
    
    // Filter by selected sub-categories
    if (selectedSubCategories.length > 0 && 
        !selectedSubCategories.some(subCat => product.subCategories?.includes(subCat))) {
      return false;
    }
    
    // Filter by selected volumes
    if (selectedVolumes.length > 0) {
      const productVolume = product.attributes?.volume || '';
      if (!selectedVolumes.includes(productVolume)) {
        return false;
      }
    }
    
    return true;
  }).sort((a, b) => {
    // Sort products
    switch (sortBy) {
      case 'price-low-high':
        return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
      case 'price-high-low':
        return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'name-a-z':
        return a.name.localeCompare(b.name);
      case 'name-z-a':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });
  
  const handleSubCategoryToggle = (subCategory: string) => {
    setSelectedSubCategories(prev => 
      prev.includes(subCategory)
        ? prev.filter(sc => sc !== subCategory)
        : [...prev, subCategory]
    );
  };
  
  const handleVolumeToggle = (volume: string) => {
    setSelectedVolumes(prev => 
      prev.includes(volume)
        ? prev.filter(v => v !== volume)
        : [...prev, volume]
    );
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 10000]);
    setSortBy('newest');
    setSelectedSubCategories([]);
    setSelectedVolumes([]);
  };
  
  return (
    <>
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
        
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-md"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white"
            >
              <FiFilter className="mr-2" />
              Filters
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-3 border border-gray-300 rounded-md bg-white"
            >
              <option value="newest">Newest</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="name-a-z">Name: A to Z</option>
              <option value="name-z-a">Name: Z to A</option>
            </select>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-8 p-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-500">
                <FiX size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-2">Price Range</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">Min</label>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">Max</label>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min={priceRange[0]}
                    />
                  </div>
                </div>
              </div>
              
              {/* Sub-Categories */}
              {availableSubCategories.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Sub-Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableSubCategories.map(subCategory => (
                      <button
                        key={subCategory}
                        onClick={() => handleSubCategoryToggle(subCategory)}
                        className={`px-3 py-1 text-sm rounded-full ${
                          selectedSubCategories.includes(subCategory)
                            ? 'bg-black text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {subCategory}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Volumes */}
              {availableVolumes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Volumes</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableVolumes.map(volume => (
                      <button
                        key={volume}
                        onClick={() => handleVolumeToggle(volume)}
                        className={`px-3 py-1 text-sm rounded-full ${
                          selectedVolumes.includes(volume)
                            ? 'bg-black text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {volume}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
} 