import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Product from '../../../models/Product';

// Connect to MongoDB with connection pooling
let isConnected = false;

const connectMongo = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    // Prevent multiple connections in development
    if (mongoose.connections[0].readyState) {
      isConnected = true;
      console.log('Using existing MongoDB connection');
      return;
    }
    
    await mongoose.connect("mongodb+srv://Yash:8BQEkh4JaATCGblO@yash.pweao0h.mongodb.net/ecommerce");
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw new Error('Failed to connect to database');
  }
};

// GET a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    // Ensure params is properly awaited
    const id = params.id;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

// UPDATE a product by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    // Ensure params is properly awaited
    const id = params.id;
    
    // Handle multipart form data
    const formData = await request.formData();
    
    // Parse product info from form data
    const productInfoJson = formData.get('productInfo') as string;
    if (!productInfoJson) {
      return NextResponse.json({ success: false, error: 'Product information is required' }, { status: 400 });
    }
    
    const productInfo = JSON.parse(productInfoJson);
    
    // Get existing images if any
    const existingImagesJson = formData.get('existingImages') as string;
    const existingImages = existingImagesJson ? JSON.parse(existingImagesJson) : [];
    
    // Handle new image files if they exist
    const newImages = [];
    for (let [key, value] of formData.entries()) {
      if (key.startsWith('media_') && value instanceof File) {
        // In a real app, you would upload these files to a storage service
        // For now, we'll just use their names or simulate URLs
        newImages.push(`/uploads/${value.name}`);
      }
    }
    
    // Combine existing and new images
    const images = [...existingImages, ...newImages];
    
    // Set main image or default if none provided
    const mainImage = productInfo.mainImage || (images.length > 0 ? images[0] : '/placeholder.jpg');
    
    // Create product data with all fields
    const productData = {
      name: productInfo.name,
      slug: (productInfo.slug || productInfo.name.toLowerCase().replace(/\s+/g, '-')) + '-' + Date.now().toString().slice(-6),
      description: productInfo.description,
      price: parseFloat(productInfo.price.toString()),
      comparePrice: productInfo.comparePrice ? parseFloat(productInfo.comparePrice.toString()) : 0,
      images: images,
      mainImage: mainImage,
      productType: productInfo.productType,
      category: productInfo.category,
      subCategories: productInfo.subCategories || [],
      brand: productInfo.brand || 'Avito Scent',
      sku: productInfo.sku,
      quantity: productInfo.quantity || 0,
      featured: productInfo.featured || false,
      bestSelling: productInfo.bestSelling || false,
      newArrivals: productInfo.newArrivals || false,
      bestBuy: productInfo.bestBuy || false,
      isNewProduct: productInfo.newArrivals || false,
      onSale: productInfo.comparePrice && productInfo.comparePrice > productInfo.price,
      attributes: {
        gender: productInfo.gender,
        volume: productInfo.volume,
        about: productInfo.about,
        disclaimer: productInfo.disclaimer || ''
      }
    };
    
    console.log('Updating product:', id);
    
    const product = await Product.findByIdAndUpdate(
      id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    console.log('Product updated successfully:', product._id);
    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Server error';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle MongoDB duplicate key errors
      if (error instanceof mongoose.Error.ValidationError) {
        errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
        statusCode = 400;
      } else if (error.name === 'MongoServerError' && (error as any).code === 11000) {
        errorMessage = 'A product with this SKU already exists';
        statusCode = 409;
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage
    }, { status: statusCode });
  }
}

// DELETE a product by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    // Ensure params is properly awaited
    const id = params.id;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    console.log('Product deleted successfully:', id);
    return NextResponse.json({ success: true, message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
} 