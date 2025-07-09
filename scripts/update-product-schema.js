// This script updates the product schema to include the new fields
// Run with: node scripts/update-product-schema.js

const mongoose = require('mongoose');

// MongoDB connection string - hardcoded for simplicity
const MONGODB_URI = "mongodb+srv://Yash:8BQEkh4JaATCGblO@yash.pweao0h.mongodb.net/ecommerce";

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Define the Product schema
const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  price: Number,
  comparePrice: Number,
  images: [String],
  videos: [String],
  mainImage: String,
  productType: String,
  category: String,
  subCategories: [String],
  brand: String,
  sku: String,
  quantity: Number,
  sold: Number,
  featured: Boolean,
  isNewProduct: Boolean,
  onSale: Boolean,
  bestSelling: Boolean,
  newArrivals: Boolean,
  bestBuy: Boolean,
  attributes: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Create the Product model
const Product = mongoose.model('Product', ProductSchema);

// Function to determine product type and category from existing categories
function determineProductTypeAndCategory(categories) {
  if (!categories) return { productType: 'Perfumes', category: 'Value for Money' };
  
  // Convert to array if it's a string
  const categoryArray = typeof categories === 'string' 
    ? categories.split(',').map(c => c.trim()) 
    : categories;
  
  if (categoryArray.includes('Car Diffuser') || categoryArray.includes('Room Spray')) {
    return {
      productType: 'Air Fresheners',
      category: categoryArray.includes('Car Diffuser') ? 'Car Diffusers' : 'Room Fresheners'
    };
  } else if (categoryArray.includes('Attar')) {
    return {
      productType: 'Aesthetic Attars',
      category: categoryArray.includes('Luxury') ? 'Luxury Attars' : 'Premium Attars'
    };
  } else if (categoryArray.includes('Waxfume')) {
    return {
      productType: 'Waxfume (Solid)',
      category: 'Tin Zar'
    };
  } else {
    // For perfumes, determine the category
    if (categoryArray.includes('Luxury')) {
      return { productType: 'Perfumes', category: 'Luxury Perfumes' };
    } else if (categoryArray.includes('Premium')) {
      return { productType: 'Perfumes', category: 'Premium Perfumes' };
    } else {
      return { productType: 'Perfumes', category: 'Value for Money' };
    }
  }
}

// Update all products
async function updateProducts() {
  try {
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);
    
    // Update each product
    for (const product of products) {
      // Determine product type and category
      const { productType, category } = determineProductTypeAndCategory(product.category);
      
      // Set new fields
      product.productType = productType;
      product.category = category;
      product.subCategories = [];
      product.bestSelling = product.category.includes('Bestseller') || false;
      product.newArrivals = product.isNewProduct || false;
      product.bestBuy = false;
      
      // Save the updated product
      await product.save();
      console.log(`Updated product: ${product.name}`);
    }
    
    console.log('All products updated successfully');
  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

// Run the update function
updateProducts(); 