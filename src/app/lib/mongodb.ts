import mongoose from 'mongoose';

// Configure Mongoose in development mode
if (process.env.NODE_ENV === 'development') {
  mongoose.set('strictQuery', false);
  mongoose.set('autoIndex', false); // Disable automatic index creation to prevent warnings
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not defined');
  console.error('Please create or update your .env.local file with a valid MongoDB connection string');
  console.error('Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
}

// Global interface
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use a global variable to cache the mongoose connection
let globalWithMongoose = global as typeof globalThis & {
  mongoose: MongooseConnection;
};

// Initialize the cached connection
if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using mongoose
 * @returns Promise that resolves to the mongoose instance
 */
async function connectMongoDB(): Promise<typeof mongoose> {
  // If there's an existing connection, return it
  if (globalWithMongoose.mongoose.conn) {
    return globalWithMongoose.mongoose.conn;
  }

  // If a connection is in progress, wait for it
  if (!globalWithMongoose.mongoose.promise) {
    // Connect to the database
    console.log('Connecting to MongoDB...');
    
    if (!MONGODB_URI) {
      console.error('MONGODB_URI is undefined or empty!');
      throw new Error('MongoDB connection error: MONGODB_URI environment variable is not defined. Please check your .env.local file.');
    }
    
    console.log('MongoDB URI format check:', 
      MONGODB_URI.startsWith('mongodb+srv://') || MONGODB_URI.startsWith('mongodb://') ? 'Valid format' : 'Invalid format');
    
    if (!MONGODB_URI.startsWith('mongodb+srv://') && !MONGODB_URI.startsWith('mongodb://')) {
      throw new Error('MongoDB connection error: Invalid MongoDB URI format. URI should start with mongodb:// or mongodb+srv://');
    }
    
    const connectionOptions = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    };
    
    globalWithMongoose.mongoose.promise = mongoose.connect(MONGODB_URI, connectionOptions)
    .then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      console.error('Connection error details:', error.message);
      
      // Provide more specific error messages based on error type
      if (error.name === 'MongoNetworkError') {
        console.error('Network error - check your connection and MongoDB URI');
        throw new Error('MongoDB connection error: Network issue. Check your internet connection and MongoDB URI.');
      } else if (error.name === 'MongoServerSelectionError') {
        console.error('Server selection error - MongoDB server may be down or unreachable');
        if (error.message.includes('ENOTFOUND')) {
          throw new Error('MongoDB connection error: Could not find the database server. Please check the hostname in your connection string.');
        } else {
          throw new Error('MongoDB connection error: Could not connect to the database server. It may be down or unreachable.');
        }
      } else {
        throw new Error(`MongoDB connection error: ${error.message}`);
      }
    });
  }

  try {
    // Wait for the connection to be established
    globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise;
    return globalWithMongoose.mongoose.conn;
  } catch (error) {
    // Reset the promise if there's an error
    globalWithMongoose.mongoose.promise = null;
    console.error('Failed to establish MongoDB connection:', error);
    throw error;
  }
}

export default connectMongoDB; 