import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        role: string;
      };
    }
  }
}

// JWT secret - in production this should come from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Simple user store - in production this would be a database
const users = [
  { 
    id: 1, 
    username: 'admin', 
    email: 'admin@astrologyinsights.ge', 
    password: 'admin123', // In production, this should be hashed
    role: 'admin' 
  },
  { 
    id: 2, 
    username: 'editor', 
    email: 'editor@astrologyinsights.ge', 
    password: 'editor123', 
    role: 'editor' 
  }
];

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

// Generate JWT token
export function generateToken(user: { id: number; username: string; email: string; role: string }) {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token middleware
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      message: 'Access token required',
      code: 'UNAUTHORIZED' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      console.error('JWT verification failed:', err.message);
      return res.status(403).json({ 
        message: 'Invalid or expired token',
        code: 'FORBIDDEN' 
      });
    }
    
    req.user = decoded;
    next();
  });
}

// Optional authentication - doesn't fail if no token
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (!err && decoded) {
      req.user = decoded;
    }
    next();
  });
}

// Role-based access control
export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'UNAUTHORIZED' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        code: 'FORBIDDEN',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
}

// Admin only middleware
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole('admin')(req, res, next);
}

// Editor or Admin middleware
export function requireEditor(req: Request, res: Response, next: NextFunction) {
  return requireRole(['admin', 'editor'])(req, res, next);
}

// Login function
export function authenticateUser(username: string, password: string) {
  const user = users.find(u => 
    u.username === username && u.password === password
  );
  
  if (!user) {
    return null;
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Get user by ID
export function getUserById(id: number) {
  const user = users.find(u => u.id === id);
  if (!user) return null;
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
} 