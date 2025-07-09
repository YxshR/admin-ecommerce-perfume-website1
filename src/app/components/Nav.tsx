'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { FiShoppingBag, FiHeart, FiSearch, FiX, FiMenu, FiChevronDown } from 'react-icons/fi';
import MiniCartWithModal from './MiniCartWithModal';

// Define types for nav item settings
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

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  
  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Dropdown refs
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // State for admin-configured settings
  const [navItems, setNavItems] = useState<Record<string, boolean>>({
    home: true,
    perfumes: true,
    "aesthetic-attars": true,
    "air-fresheners": true,
    "waxfume": true,
    "new-arrivals": true,
    "about-us": true,
    track: true
  });
  
  const [componentSettings, setComponentSettings] = useState<Record<string, boolean>>({
    announcement: true,
    search: true,
    miniCart: true,
    wishlist: true
  });
  
  // Load settings from localStorage
  useEffect(() => {
    try {
      // Load navigation settings
      const savedNavItems = localStorage.getItem('store_nav_settings');
      if (savedNavItems) {
        const parsedItems = JSON.parse(savedNavItems);
        const navMap: Record<string, boolean> = {};
        parsedItems.forEach((item: NavItem) => {
          navMap[item.id] = item.enabled;
        });
        setNavItems(navMap);
      }
      
      // Load component settings
      const savedComponents = localStorage.getItem('store_component_settings');
      if (savedComponents) {
        const parsedComponents = JSON.parse(savedComponents);
        const componentMap: Record<string, boolean> = {};
        parsedComponents.forEach((component: StoreComponent) => {
          componentMap[component.id] = component.enabled;
        });
        
        // Apply component settings (e.g., hide announcement bar if disabled)
        if (componentMap.announcement !== undefined) {
          setShowAnnouncement(componentMap.announcement);
        }
        
        setComponentSettings(componentMap);
      }
    } catch (error) {
      console.error('Error loading navigation settings:', error);
    }
  }, []);
  
  // Fetch cart items count
  useEffect(() => {
    const getCartCount = () => {
      try {
        // Get cart from localStorage
        const cart = localStorage.getItem('cart');
        if (cart) {
          const parsedCart = JSON.parse(cart);
          if (Array.isArray(parsedCart)) {
            // Count total items including quantities
            const count = parsedCart.reduce((total: number, item: any) => total + item.quantity, 0);
            console.log("localStorage cart count:", count);
            setCartItemsCount(count);
          } else {
            setCartItemsCount(0);
          }
        } else {
          setCartItemsCount(0);
        }
      } catch (parseError) {
        console.error('Error parsing localStorage cart:', parseError);
        setCartItemsCount(0);
      }
    };
    
    // Initial count
    getCartCount();
    
    // Set up event listeners
    const handleStorageChange = () => {
      console.log('Storage event detected in Nav, updating cart count');
      getCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Add a timer to periodically check cart count (every 5 seconds)
    const intervalId = setInterval(getCartCount, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Handle clicks outside the dropdowns
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
  
  // Listen for custom event to open mini cart
  useEffect(() => {
    const handleOpenMiniCart = () => {
      setMiniCartOpen(true);
    };
    
    // Check for localStorage flag to open checkout modal
    const checkForCheckoutFlag = () => {
      try {
        const openCheckoutModal = localStorage.getItem('open_checkout_modal');
        if (openCheckoutModal === 'true') {
          // Clear the flag
          localStorage.removeItem('open_checkout_modal');
          // Open mini cart
          setMiniCartOpen(true);
        }
      } catch (error) {
        console.error('Error checking localStorage for checkout flag:', error);
      }
    };
    
    // Check when component mounts
    checkForCheckoutFlag();
    
    window.addEventListener('openMiniCart', handleOpenMiniCart);
    // Also listen for storage events in case the flag is set from another tab
    window.addEventListener('storage', checkForCheckoutFlag);
    
    return () => {
      window.removeEventListener('openMiniCart', handleOpenMiniCart);
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
  
  // Navigation items with dropdowns
  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      name: 'Home',
      path: '/',
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
      path: '/collection',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Value for Money', path: '/perfumes/value-for-money' },
        { name: 'Premium Perfumes', path: '/perfumes/premium' },
        { name: 'Luxury Perfumes', path: '/perfumes/luxury' },
        { name: 'Combo Sets', path: '/perfumes/combo' }
      ]
    },
    {
      id: 'aesthetic-attars',
      name: 'Aesthetic Attars',
      path: '/aesthetic-attars',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Premium Attars', path: '/aesthetic-attars/premium' },
        { name: 'Luxury Attars', path: '/aesthetic-attars/luxury' },
        { name: 'Combo Sets', path: '/aesthetic-attars/combo' }
      ]
    },
    {
      id: 'air-fresheners',
      name: 'Air Fresheners',
      path: '/air-fresheners',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Room Air Fresheners', path: '/air-fresheners/room' },
        { name: 'Luxury Car Diffusers', path: '/air-fresheners/car' }
      ]
    },
    {
      id: 'waxfume',
      name: 'Waxfume',
      path: '/waxfume',
      hasDropdown: false
    },
    {
      id: 'about-us',
      name: 'About Us',
      path: '/about-us',
      hasDropdown: false
    }
  ];
  
  return (
    <>
      {/* Announcement Bar */}
      {showAnnouncement && (
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
                src="/logoog.jpg"
                alt="Avito Scent"
                className="h-10 w-auto"
              />
              
              <p>Avito Scent</p>
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
              
              {/* Wishlist */}
              {/* {componentSettings.wishlist && (
                <Link
                  href="/wishlist"
                  className="text-gray-700 hover:text-black hidden md:block p-2 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-110"
                  aria-label="Wishlist"
                >
                  <FiHeart size={20} />
                </Link>
              )} */}
              
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
                {navItems["about-us"] && (
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
                
                {/* {componentSettings.wishlist && (
                  <Link
                    href="/wishlist"
                    className="block py-2 text-gray-700 hover:text-black transition-colors duration-200 hover:pl-2 border-l-0 hover:border-l-2 hover:border-black"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                )} */}
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