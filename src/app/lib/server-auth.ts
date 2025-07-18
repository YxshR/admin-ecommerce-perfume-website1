import * as jose from 'jose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from './db-connect';
import User from '../models/User';

// Secret used for JWT signing
const getSecret = () => {
  const secretKey = process.env.JWT_SECRET;
  
  if (!secretKey) {
    console.warn('JWT_SECRET not found in environment variables, using fallback secret');
    // Fallback for development only - DO NOT use in production
    return new TextEncoder().encode('your_jwt_secret_key_should_be_very_long_and_random');
  }
  
  return new TextEncoder().encode(secretKey);
};

// Token expiration time (24 hours)
export const expTime = '24h';
// Token expiration in milliseconds (24 hours)
export const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-key-change-in-production';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-jwt-secret-key-change-in-production';

/**
 * Generate a JWT token containing user data
 */
export async function encrypt(payload: any) {
  try {
    const secret = getSecret();
    
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expTime)
      .sign(secret);
    
    return token;
  } catch (error) {
    console.error('Failed to generate token:', error);
    throw new Error('Failed to generate token');
  }
}

/**
 * Verify and decode a JWT token
 */
export async function decrypt(token: string) {
  try {
    const secret = getSecret();
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Failed to decrypt token:', error);
    return null;
  }
}

/**
 * Verify if a JWT token is valid and not expired
 */
export async function isValidToken(token: string) {
  try {
    const decoded = await decrypt(token);
    return !!decoded;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

/**
 * Get user details from a JWT token
 */
export async function getUserFromToken(token: string) {
  try {
    const decoded = await decrypt(token);
    if (!decoded) return null;
    
    return {
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

// Generate JWT token for users
export async function generateToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Generate JWT token for admin
export async function generateAdminToken(payload: any) {
  return jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: '1d' });
}

// Verify user token
export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    
    // Connect to database
    await connectToDatabase();
    
    // Find user by ID
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.warn('User not found for token ID:', decoded.id);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error verifying user token:', error);
    return null;
  }
}

// Verify admin token
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    console.log('Verifying admin token...');
    
    // First verify with jose
    const secret = getSecret();
    const { payload } = await jose.jwtVerify(token, secret);
    
    if (!payload) {
      console.error('Admin token verification failed: No payload');
      return false;
    }
    
    if (payload.role !== 'admin') {
      console.error('Admin token verification failed: Not an admin role', payload);
      return false;
    }
    
    console.log('Admin token verified successfully');
    return true;
  } catch (error) {
    console.error('Admin token verification error:', error);
    return false;
  }
}

// Hash password
export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare passwords
export async function comparePasswords(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
} 