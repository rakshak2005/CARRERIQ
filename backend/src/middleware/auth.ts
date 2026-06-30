import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'carreriq-ce38c';

// In-memory cache for Google's public x509 certificates
let googleCertificates: Record<string, string> = {};
let cacheExpiry = 0;

const fetchGoogleCertificates = async (): Promise<Record<string, string>> => {
  const now = Date.now();
  if (Object.keys(googleCertificates).length > 0 && now < cacheExpiry) {
    return googleCertificates;
  }

  try {
    const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
    if (!res.ok) throw new Error('Failed to fetch Google certificates');
    
    const cacheControl = res.headers.get('cache-control');
    let maxAge = 3600;
    if (cacheControl) {
      const match = cacheControl.match(/max-age=(\d+)/);
      if (match) {
        maxAge = parseInt(match[1], 10);
      }
    }

    googleCertificates = await res.json() as Record<string, string>;
    cacheExpiry = Date.now() + maxAge * 1000;
    return googleCertificates;
  } catch (err) {
    console.error('Error fetching Google x509 certificates:', err);
    return googleCertificates;
  }
};

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'student' | 'recruiter' | 'admin';
  };
}

export const verifyFirebaseIdToken = async (token: string): Promise<{ email: string; uid: string } | null> => {
  if (token.startsWith('simulated-token:')) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[SECURITY WARNING] Rejecting mock token in production environment.');
      return null;
    }
    const parts = token.split(':');
    const email = parts[1];
    const uid = parts[2] || `simulated-${email}`;
    return { email, uid };
  }

  try {
    const decodedTokenHeader = jwt.decode(token, { complete: true });
    if (!decodedTokenHeader || !decodedTokenHeader.header.kid) {
      return null;
    }

    const kid = decodedTokenHeader.header.kid;
    const certs = await fetchGoogleCertificates();
    const publicKey = certs[kid];
    if (!publicKey) {
      return null;
    }

    const decoded = jwt.verify(token, publicKey, {
      audience: PROJECT_ID,
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      algorithms: ['RS256'],
    }) as any;

    return {
      email: decoded.email || '',
      uid: decoded.sub || '',
    };
  } catch (err) {
    console.error('Error verifying Firebase ID token:', err);
    return null;
  }
};

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = await verifyFirebaseIdToken(token);
    if (!decoded || !decoded.email) {
      return res.status(403).json({ error: 'Invalid or expired token payload' });
    }

    const user = await db.getUserByEmail(decoded.email);
    if (!user) {
      return res.status(404).json({ error: 'User profile not synchronized in local database' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as 'student' | 'recruiter' | 'admin',
    };
    next();
  } catch (error: any) {
    console.error('[Firebase Token Verification] Error verifying token:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (role: 'student' | 'recruiter' | 'admin') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden: requires ${role} role` });
    }
    next();
  };
};

