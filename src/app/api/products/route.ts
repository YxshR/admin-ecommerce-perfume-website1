import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Product from '../../models/Product';
import connectMongoDB from '@/app/lib/mongodb';

// GET all products
export async function GET() {
  try {
    await connectMongoDB();
    
    const products = await Product.find({}).sort({ createdAt: -1 });
    
    // Transform products to include gender and ml values directly in the product object
    const transformedProducts = products.map(product => {
      // Use any type to allow adding custom properties
      const productObj: any = product.toObject();
      
      // Extract gender and volume from attributes if they exist
      if (productObj.attributes) {
        // Convert Map to object if needed
        const attrs = productObj.attributes instanceof Map 
          ? Object.fromEntries(productObj.attributes) 
          : productObj.attributes;
          
        // Add gender directly to product
        if (attrs.gender) {
          productObj.gender = attrs.gender.toLowerCase();
        }
        
        // Add ml/volume directly to product
        if (attrs.volume) {
          // Try to extract numeric value if it's in format like "50 ML"
          const volumeMatch = String(attrs.volume).match(/(\d+)\s*ml/i);
          if (volumeMatch && volumeMatch[1]) {
            productObj.ml = parseInt(volumeMatch[1], 10);
          } else if (!isNaN(Number(attrs.volume))) {
            // If it's just a number
            productObj.ml = parseInt(attrs.volume, 10);
          }
        }
      }
      
      return productObj;
    });
    
    return NextResponse.json({ success: true, products: transformedProducts }, { status: 200 });
  } catch (err) {
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
    
    // Extract media URLs from the product info
    // The media URLs should already be uploaded to Cloudinary at this point
    const mediaItems = productInfo.media || [];
    const images = mediaItems
      .filter((media: any) => media.type === 'image')
      .map((media: any) => media.url);
    
    const videos = mediaItems
      .filter((media: any) => media.type === 'video')
      .map((media: any) => media.url);
    
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
      videos: videos, // Store videos separately
      mainImage: mainImage,
      category: productInfo.category.join(', '), // Convert array to string with commas
      brand: productInfo.brand || 'Avito Scent',
      sku: productInfo.sku,
      quantity: parseInt(productInfo.quantity.toString() || '0'),
      featured: productInfo.featured || false,
      isNewProduct: productInfo.new_arrival || false,
      onSale: productInfo.comparePrice && productInfo.comparePrice > productInfo.price,
      attributes: {
        gender: productInfo.gender,
        volume: productInfo.volume,
        about: productInfo.about,
        disclaimer: productInfo.disclaimer || ''
      }
    };
    
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