'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiMenu, FiX, FiChevronDown, FiSearch, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from './AuthProvider';
import MiniCartWithModal from './MiniCartWithModal';

// Define interfaces for component props and state
interface NavItem {
  id: string;
  name: string;
  enabled: boolean;
  path: string;
}

interface StoreComponent {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

interface DropdownItem {
  name: string;
  path: string;
}

interface NavigationItem {
  id: string;
  name: string;
  path: string;
  hasDropdown: boolean;
  dropdownItems?: DropdownItem[];
}

// Define a type for the navigation items state
interface NavItems {
  [key: string]: boolean;
  home: boolean;
  collection: boolean;
  perfumes: boolean;
  attars: boolean;
  fresheners: boolean;
  waxfume: boolean;
  about: boolean;
  track: boolean;
}

// Define a type for component settings
interface ComponentSettings {
  [key: string]: boolean;
  search: boolean;
  miniCart: boolean;
  announcement: boolean;
}

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  
  // Refs for dropdown elements
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Store navigation items
  const [navItems, setNavItems] = useState<NavItems>({
    home: true,
    collection: true,
    perfumes: true,
    attars: true,
    fresheners: true,
    waxfume: true,
    about: true,
    track: true
  });
  
  // Store component settings
  const [componentSettings, setComponentSettings] = useState<ComponentSettings>({
    search: true,
    miniCart: true,
    announcement: true
  });
  
  // Fetch layout settings from API
  useEffect(() => {
    const fetchLayoutSettings = async () => {
      try {
        const response = await fetch('/api/layout/products');
        if (response.ok) {
          const data = await response.json();
          
          // Update navigation items based on API response
          if (data.navItems) {
            setNavItems(prev => ({
              ...prev,
              ...data.navItems
            }));
          }
          
          // Update component settings based on API response
          if (data.components) {
            setComponentSettings(prev => ({
              ...prev,
              ...data.components
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching layout settings:', error);
      }
    };
    
    fetchLayoutSettings();
  }, []);
  
  // Get cart items count from localStorage
  useEffect(() => {
    const getCartCount = () => {
      try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          if (Array.isArray(parsedCart)) {
            // Count total items in cart
            const totalItems = parsedCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            setCartItemsCount(totalItems);
          } else {
            setCartItemsCount(0);
          }
        } else {
          setCartItemsCount(0);
        }
      } catch (error) {
        console.error('Error loading cart count:', error);
        setCartItemsCount(0);
      }
    };
    
    // Initial count
    getCartCount();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      getCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events
    window.addEventListener('cart-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleStorageChange);
    };
  }, []);
  
  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && 
          dropdownRefs.current[activeDropdown] && 
          !dropdownRefs.current[activeDropdown]?.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);
  
  // Handle open mini cart from other components
  useEffect(() => {
    const handleOpenMiniCart = () => {
      setMiniCartOpen(true);
    };
    
    window.addEventListener('open-minicart', handleOpenMiniCart);
    
    const checkForCheckoutFlag = () => {
      try {
        const checkoutComplete = localStorage.getItem('checkout_complete');
        if (checkoutComplete === 'true') {
          // Clear the flag
          localStorage.removeItem('checkout_complete');
          
          // Show mini cart with success message
          setMiniCartOpen(true);
        }
      } catch (error) {
        console.error('Error checking checkout flag:', error);
      }
    };
    
    // Check for checkout flag on mount
    checkForCheckoutFlag();
    
    // Also check when storage changes
    window.addEventListener('storage', checkForCheckoutFlag);
    
    return () => {
      window.removeEventListener('open-minicart', handleOpenMiniCart);
      window.removeEventListener('storage', checkForCheckoutFlag);
    };
  }, []);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };
  
  const handleDropdownHover = (id: string) => {
    setActiveDropdown(id);
  };
  
  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };
  
  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };
  
  const toggleMiniCart = () => {
    setMiniCartOpen(!miniCartOpen);
  };
  
  // Navigation items configuration
  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      name: 'Home',
      path: '/',
      hasDropdown: false
    },
    {
      id: 'collection',
      name: 'Collection',
      path: '/collection',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Best Selling', path: '/best-selling' },
        { name: 'New Arrivals', path: '/new-arrivals' },
        { name: 'Best Buy', path: '/best-buy' }
      ]
    },
    {
      id: 'perfumes',
      name: 'Perfumes',
      path: '/perfumes',
      hasDropdown: true,
      dropdownItems: [
        {
          name: 'All Perfumes',
          path: '/perfumes'
        },
        {
          name: 'Luxury Collection',
          path: '/perfumes/luxury'
        },
        {
          name: 'Premium Collection',
          path: '/perfumes/premium'
        },
        {
          name: 'Value For Money',
          path: '/perfumes/value-for-money'
        },
        {
          name: 'Combo Offers',
          path: '/perfumes/combo'
        }
      ]
    },
    {
      id: 'attars',
      name: 'Aesthetic Attars',
      path: '/aesthetic-attars',
      hasDropdown: true,
      dropdownItems: [
        {
          name: 'All Attars',
          path: '/aesthetic-attars'
        },
        {
          name: 'Premium Attars',
          path: '/aesthetic-attars/premium'
        },
        {
          name: 'Luxury Attars',
          path: '/aesthetic-attars/luxury'
        },
        {
          name: 'Combo Offers',
          path: '/aesthetic-attars/combo'
        }
      ]
    },
    {
      id: 'fresheners',
      name: 'Air Fresheners',
      path: '/air-fresheners',
      hasDropdown: true,
      dropdownItems: [
        {
          name: 'All Fresheners',
          path: '/air-fresheners'
        },
        {
          name: 'Car Fresheners',
          path: '/air-fresheners/car'
        },
        {
          name: 'Room Fresheners',
          path: '/air-fresheners/room'
        }
      ]
    },
    {
      id: 'waxfume',
      name: 'Waxfume',
      path: '/waxfume',
      hasDropdown: false
    },
    {
      id: 'about',
      name: 'About Us',
      path: '/about-us',
      hasDropdown: false
    }
  ];
  
  return (
    <>
      {/* Announcement Bar */}
      {componentSettings.announcement && (
        <div className="bg-black text-white text-center py-2 text-sm">
          Free shipping on orders above ₹500
        </div>
      )}
      
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex gap-2 items-center">
              <img
                src="/avitologo.png"
                alt="Avito Scent"
                className="h-16 w-auto"
              />
              
             
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => 
                navItems[item.id] ? (
                  <div 
                    key={item.id}
                    className="relative group"
                    ref={(el) => {
                      dropdownRefs.current[item.id] = el;
                    }}
                    onMouseEnter={() => item.hasDropdown && handleDropdownHover(item.id)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div 
                      className={`flex items-center font-medium cursor-pointer relative 
                        ${pathname === item.path || pathname?.startsWith(item.path + '/') 
                          ? 'text-black' 
                          : 'text-gray-700 hover:text-black'}
                        ${pathname === item.path || pathname?.startsWith(item.path + '/') 
                          ? 'after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-black' 
                          : 'after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-black after:transition-all after:duration-300 hover:after:w-full'
                        }`}
                      onClick={() => {
                        if (item.hasDropdown) {
                          toggleDropdown(item.id);
                          router.push(item.path);
                        } else {
                          router.push(item.path);
                        }
                      }}
                    >
                      {item.name}
                      {item.hasDropdown && <FiChevronDown className="ml-1 transition-transform duration-300 group-hover:rotate-180" size={16} />}
                    </div>
                    
                    {item.hasDropdown && activeDropdown === item.id && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white shadow-lg rounded-md overflow-hidden z-20 transition-all duration-300 ease-in-out transform origin-top-left animate-fadeIn">
                        <div className="py-2">
                          {item.dropdownItems?.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.path}
                              href={dropdownItem.path}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-all duration-200 hover:pl-6 border-l-0 hover:border-l-4 hover:border-black flex items-center"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <span className="w-2 h-2 rounded-full bg-black mr-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null
              )}
            </nav>
            
            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              {componentSettings.search && (
                <button
                  onClick={toggleSearch}
                  className="text-gray-700 hover:text-black relative p-2 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-110"
                  aria-label="Search"
                >
                  <FiSearch size={20} />
                </button>
              )}
              
              {/* Cart */}
              {componentSettings.miniCart && (
                <button
                  onClick={toggleMiniCart}
                  className="text-gray-700 hover:text-black relative p-2 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-110"
                  aria-label="Cart"
                >
                  <FiShoppingBag size={20} />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-transform duration-300 animate-pulse">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              )}
              
              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden text-gray-700 hover:text-black p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-gray-200 py-4 px-4">
            <div className="container mx-auto">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="flex-1 border-gray-300 border rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button className="bg-black text-white py-2 px-6 rounded-r-md hover:bg-gray-800">
                  Search
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 fixed inset-x-0 top-[60px] z-20 overflow-y-auto max-h-[calc(100vh-60px)]">
          <div className="container mx-auto px-4 py-4">
            <nav className="space-y-4">
              {navigationItems.map((item) => 
                navItems[item.id] ? (
                  <div key={item.id}>
                    {item.hasDropdown ? (
                      <>
                        <Link
                          href={item.path}
                          className="flex items-center justify-between w-full py-2 font-medium text-gray-700 hover:text-black transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span>{item.name}</span>
                          <FiChevronDown className="ml-1" size={16} />
                        </Link>
                        
                        <div className="pl-4 mt-2 space-y-2 border-l border-gray-200">
                          {item.dropdownItems?.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.path}
                              href={dropdownItem.path}
                              className="block py-2 text-gray-600 hover:text-black transition-colors hover:pl-2"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : (
                      <Link
                        href={item.path}
                        className="block py-2 font-medium text-gray-700 hover:text-black transition-colors duration-200 hover:pl-2 border-l-0 hover:border-l-2 hover:border-black"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ) : null
              )}
              
              {/* Additional mobile menu items */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {navItems.about && (
                  <Link
                    href="/about-us"
                    className="block py-2 text-gray-700 hover:text-black transition-colors duration-200 hover:pl-2 border-l-0 hover:border-l-2 hover:border-black"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About Us
                  </Link>
                )}
                
                {navItems.track && (
                  <Link
                    href="/track-order"
                    className="block py-2 text-gray-700 hover:text-black transition-colors duration-200 hover:pl-2 border-l-0 hover:border-l-2 hover:border-black"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Track Order
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
      
      {/* Mini Cart */}
      <MiniCartWithModal isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
    </>
  );
} 