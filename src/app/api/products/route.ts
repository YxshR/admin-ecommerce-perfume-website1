import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Product from '../../models/Product';
import connectMongoDB from '@/app/lib/mongodb';

// GET all products with optional filtering
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    
    // Parse query parameters
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const productType = url.searchParams.get('productType');
    const tag = url.searchParams.get('tag');
    
    // Build filter object
    const filter: any = {};
    
    if (category) {
      // Handle category mapping
      if (category === 'aesthetic-attars') {
        filter.productType = 'Aesthetic Attars';
      } else if (category === 'perfumes') {
        filter.productType = 'Perfumes';
      } else if (category === 'air-fresheners') {
        filter.productType = 'Air Fresheners';
      } else if (category === 'waxfume') {
        filter.productType = 'Waxfume (Solid)';
      } else {
        filter.category = category;
      }
    }
    
    if (productType) {
      filter.productType = productType;
    }
    
    // Handle special tag filters
    if (tag) {
      switch (tag) {
        case 'best-seller':
          filter.isBestSelling = true;
          break;
        case 'new-arrival':
          filter.isNewArrival = true;
          break;
        case 'best-buy':
          filter.isBestBuy = true;
          break;
        default:
          // For other tags, you might have a tags array field
          filter.subCategories = tag;
          break;
      }
    }
    
    console.log('Product filter:', filter);
    
    // Execute query with filters
    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    console.log(`Found ${products.length} products matching filter`);
    
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (err) {
    console.error('Error fetching products:', err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Server error'
    }, { status: 500 });
  }
}

// POST a new product
export async function POST(request: Request) {
  try {
    // Authentication check
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');
    const regularToken = cookieStore.get('token');
    
    if (!adminToken?.value && !regularToken?.value) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    
    await connectMongoDB();
    
    // Get form data
    const formData = await request.formData();
    
    // Parse product info from form data
    const productInfoJson = formData.get('productInfo') as string;
    if (!productInfoJson) {
      return NextResponse.json({ success: false, error: 'Product information is required' }, { status: 400 });
    }
    
    const productInfo = JSON.parse(productInfoJson);
    console.log('Received product info:', productInfo);
    
    // Extract media URLs from the product info
    // The media URLs should already be uploaded to Cloudinary at this point
    const images = productInfo.images || [];
    const videos = productInfo.videos || [];
    
    // Set main image or default if none provided
    const mainImage = productInfo.mainImage || (images.length > 0 ? images[0] : '/placeholder.jpg');
    
    // Create product with all fields
    const productData = {
      name: productInfo.name,
      slug: (productInfo.slug || productInfo.name.toLowerCase().replace(/\s+/g, '-')) + '-' + Date.now().toString().slice(-6),
      description: productInfo.description,
      price: parseFloat(productInfo.price.toString()),
      comparePrice: productInfo.comparePrice ? parseFloat(productInfo.comparePrice.toString()) : undefined,
      images: images,
      videos: videos,
      mainImage: mainImage,
      
      // New categorization fields
      productType: productInfo.productType,
      category: productInfo.category,
      subCategories: productInfo.subCategories || [],
      volume: productInfo.volume,
      gender: productInfo.gender || 'Unisex', // Default to Unisex if not provided
      
      // Marketing flags
      isBestSelling: productInfo.isBestSelling || false,
      isNewArrival: productInfo.isNewArrival || false,
      isBestBuy: productInfo.isBestBuy || false,
      
      // Keep existing fields
      brand: productInfo.brand || 'Avito Scent',
      sku: productInfo.sku,
      quantity: parseInt(productInfo.quantity.toString() || '0'),
      featured: productInfo.featured || false,
      isNewProduct: productInfo.isNewArrival || false, // For backward compatibility
      onSale: productInfo.comparePrice && productInfo.comparePrice > productInfo.price,
    };
    
    console.log('Creating new product:', productData);
    
    // Save to database
    const product = await Product.create(productData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product created successfully',
      product 
    }, { status: 201 });
  } catch (err) {
    console.error('Error creating product:', err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Server error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 