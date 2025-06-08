// This file re-exports server-side authentication functions for compatibility
// This file should only be imported by server components and API routes

// Export needed functions from server-auth.ts
export { 
  TOKEN_EXPIRY, 
  comparePasswords, 
  decrypt, 
  encrypt, 
  expTime, 
  generateAdminToken, 
  generateToken, 
  getUserFromToken, 
  hashPassword, 
  isValidToken, 
  verifyAdminToken, 
  verifyToken 
} from './server-auth';

// Define getSession for compatibility
export const getSession = async (req: Request) => {
  // Get the token from Authorization header or cookies
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  
  // If we have a token, verify it and return user session
  if (token) {
    try {
      const { decrypt, getUserFromToken } = await import('./server-auth');
      const decoded = await decrypt(token);
      if (!decoded) return null;
      
      return {
        user: await getUserFromToken(token)
      };
    } catch (error) {
      console.error('Session verification error:', error);
      return null;
    }
  }
  
  return null;
}; 