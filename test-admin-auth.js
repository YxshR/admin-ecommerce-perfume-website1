// Script to test admin authentication and MongoDB connection
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Check environment variables
console.log('Environment variables check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Found' : '✗ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Found' : '✗ Missing');
console.log('ADMIN_JWT_SECRET:', process.env.ADMIN_JWT_SECRET ? '✓ Found' : '✗ Missing');

// Test MongoDB connection
async function testMongoConnection() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    return false;
  }
  
  try {
    console.log('\nTesting MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB connection successful!');
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    return true;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    return false;
  }
}

// Test JWT token generation and verification
function testJWT() {
  console.log('\nTesting JWT token generation and verification...');
  
  if (!process.env.JWT_SECRET) {
    console.error('✗ JWT_SECRET is not defined in .env.local');
    return false;
  }
  
  try {
    // Create a test payload
    const payload = {
      userId: '123456789',
      name: 'Test Admin',
      email: 'admin@example.com',
      role: 'admin'
    };
    
    // Sign with JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('✓ JWT token generated successfully');
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✓ JWT token verified successfully');
    console.log('Decoded payload:', decoded);
    
    return true;
  } catch (error) {
    console.error('✗ JWT error:', error);
    return false;
  }
}

// Test admin JWT token
function testAdminJWT() {
  console.log('\nTesting Admin JWT token generation and verification...');
  
  if (!process.env.ADMIN_JWT_SECRET) {
    console.error('✗ ADMIN_JWT_SECRET is not defined in .env.local');
    return false;
  }
  
  try {
    // Create a test payload
    const payload = {
      userId: '123456789',
      name: 'Test Admin',
      email: 'admin@example.com',
      role: 'admin'
    };
    
    // Sign with JWT
    const token = jwt.sign(payload, process.env.ADMIN_JWT_SECRET, { expiresIn: '1h' });
    console.log('✓ Admin JWT token generated successfully');
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    console.log('✓ Admin JWT token verified successfully');
    console.log('Decoded payload:', decoded);
    
    return true;
  } catch (error) {
    console.error('✗ Admin JWT error:', error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('=== Admin Authentication and MongoDB Connection Test ===\n');
  
  const mongoSuccess = await testMongoConnection();
  const jwtSuccess = testJWT();
  const adminJwtSuccess = testAdminJWT();
  
  console.log('\n=== Test Summary ===');
  console.log('MongoDB Connection:', mongoSuccess ? '✓ Success' : '✗ Failed');
  console.log('JWT Token:', jwtSuccess ? '✓ Success' : '✗ Failed');
  console.log('Admin JWT Token:', adminJwtSuccess ? '✓ Success' : '✗ Failed');
  
  if (!mongoSuccess || !jwtSuccess || !adminJwtSuccess) {
    console.log('\n⚠️ Some tests failed. Please check your .env.local configuration.');
    console.log('Make sure you have set up the following environment variables:');
    console.log('- MONGODB_URI: Your MongoDB connection string');
    console.log('- JWT_SECRET: Secret key for JWT token generation');
    console.log('- ADMIN_JWT_SECRET: Secret key for admin JWT token generation');
  } else {
    console.log('\n✅ All tests passed! Your configuration looks good.');
  }
}

runTests(); 