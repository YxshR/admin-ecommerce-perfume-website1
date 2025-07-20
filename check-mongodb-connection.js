/**
 * Script to test and troubleshoot MongoDB connection
 * Run this script with: node check-mongodb-connection.js
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Try to load environment variables
require('dotenv').config({ path: '.env.local' });

// Get MongoDB URI from environment
let MONGODB_URI = process.env.MONGODB_URI;

console.log('\n=== MongoDB Connection Checker ===\n');

// Check if MongoDB URI exists
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local file');
  console.log('Let\'s create or update your MongoDB connection string.');
} else {
  console.log('✅ MONGODB_URI found in environment variables');
  console.log(`Connection string: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Hide credentials
}

// Function to test MongoDB connection
async function testConnection(uri) {
  try {
    console.log('\nAttempting to connect to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5 seconds
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      family: 4 // Use IPv4, skip trying IPv6
    });
    
    console.log('✅ MongoDB connection successful!');
    
    // Get database name from connection
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Connected to database: ${dbName}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Provide specific troubleshooting advice based on error type
    if (error.name === 'MongoNetworkError') {
      console.log('\nTROUBLESHOOTING TIPS:');
      console.log('1. Check your internet connection');
      console.log('2. Verify that the MongoDB server is running');
      console.log('3. Check if your IP address is allowed in MongoDB Atlas network access settings');
    } else if (error.name === 'MongoServerSelectionError') {
      if (error.message.includes('ENOTFOUND')) {
        console.log('\nTROUBLESHOOTING TIPS:');
        console.log('1. The hostname in your connection string could not be found');
        console.log('2. Check for typos in your MongoDB connection string');
        console.log('3. Make sure you\'re using the correct cluster address');
      } else {
        console.log('\nTROUBLESHOOTING TIPS:');
        console.log('1. Your MongoDB server might be down or unreachable');
        console.log('2. Check if your MongoDB Atlas cluster is active');
        console.log('3. Verify your network can reach the MongoDB server');
      }
    } else if (error.message.includes('bad auth')) {
      console.log('\nTROUBLESHOOTING TIPS:');
      console.log('1. Your username or password in the connection string is incorrect');
      console.log('2. Verify your MongoDB Atlas user credentials');
    }
    
    return false;
  }
}

// Function to update .env.local file
function updateEnvFile(mongoUri) {
  try {
    const envPath = path.join(__dirname, '.env.local');
    let envContent = '';
    
    // Read existing .env.local if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Replace or add MONGODB_URI
      if (envContent.includes('MONGODB_URI=')) {
        envContent = envContent.replace(/MONGODB_URI=.*(\r?\n|$)/g, `MONGODB_URI=${mongoUri}$1`);
      } else {
        envContent += `\nMONGODB_URI=${mongoUri}\n`;
      }
    } else {
      // Create new .env.local file
      envContent = `MONGODB_URI=${mongoUri}\n`;
    }
    
    // Write updated content back to file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env.local file with new MongoDB URI');
    return true;
  } catch (error) {
    console.error('❌ Error updating .env.local file:', error.message);
    return false;
  }
}

// Main function
async function main() {
  // If MongoDB URI exists, test the connection
  if (MONGODB_URI) {
    const isConnected = await testConnection(MONGODB_URI);
    
    if (isConnected) {
      rl.question('\nDo you want to update your MongoDB connection string anyway? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          promptForNewUri();
        } else {
          console.log('\nYour MongoDB connection is working correctly. No changes needed.');
          rl.close();
        }
      });
    } else {
      promptForNewUri();
    }
  } else {
    promptForNewUri();
  }
}

// Function to prompt for new MongoDB URI
function promptForNewUri() {
  rl.question('\nEnter your MongoDB connection string (mongodb+srv://...): ', async (uri) => {
    if (!uri) {
      console.log('No connection string provided. Exiting...');
      rl.close();
      return;
    }
    
    // Test the new connection
    const isConnected = await testConnection(uri);
    
    if (isConnected) {
      rl.question('\nDo you want to save this connection string to .env.local? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          updateEnvFile(uri);
        }
        rl.close();
      });
    } else {
      rl.question('\nDo you want to try again with a different connection string? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          promptForNewUri();
        } else {
          console.log('\nExiting without updating MongoDB connection.');
          rl.close();
        }
      });
    }
  });
}

// Start the script
main();

// Handle readline close
rl.on('close', () => {
  console.log('\n=== MongoDB Connection Checker Completed ===\n');
  process.exit(0);
}); 