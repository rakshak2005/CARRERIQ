import { Router, Request, Response } from 'express';
import { db } from '../db';
import { verifyFirebaseIdToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
// Registers a firebase authenticated user in the local PostgreSQL database with a role
router.post('/register', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { role, fullName, targetRole, companyName, industry } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Firebase authentication token is required' });
    }

    if (!role || (role !== 'student' && role !== 'recruiter')) {
      return res.status(400).json({ error: 'Role must be student or recruiter' });
    }

    if (!fullName) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    const decoded = await verifyFirebaseIdToken(token);
    if (!decoded || !decoded.email) {
      return res.status(403).json({ error: 'Invalid or expired Firebase token' });
    }

    const email = decoded.email;

    // Check if user exists in local database
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists in local database' });
    }

    // Create user in local database
    const user = await db.createUser(email, 'firebase_managed', role);

    // Create corresponding profile record immediately
    if (role === 'student') {
      await db.createOrUpdateStudentProfile(
        user.id,
        fullName,
        targetRole || 'Frontend Engineer',
        '', // github
        '', // linkedin
        true, // certificatesIncluded
        false // dsaIncluded
      );
    } else {
      await db.createOrUpdateRecruiterProfile(
        user.id,
        fullName,
        companyName || 'My Company',
        '', // website
        industry || 'Technology'
      );
    }

    // Return response structure similar to original
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Error during registration sync:', error);
    res.status(500).json({ error: 'Server error during registration sync' });
  }
});

// POST /api/auth/sync
// Synchronizes a firebase authenticated user and returns their database profile metadata
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Firebase authentication token is required' });
    }

    const decoded = await verifyFirebaseIdToken(token);
    if (!decoded || !decoded.email) {
      return res.status(403).json({ error: 'Invalid or expired Firebase token' });
    }

    const email = decoded.email;

    // Fetch local user by email
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found in local database. Registration sync required.' });
    }

    // Get corresponding profile (if any)
    let profile = null;
    if (user.role === 'student') {
      profile = await db.getStudentProfileByUserId(user.id);
    } else {
      profile = await db.getRecruiterProfileByUserId(user.id);
    }

    res.json({
      message: 'Synchronization successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      profile
    });
  } catch (error: any) {
    console.error('Error during auth sync:', error);
    res.status(500).json({ error: 'Server error during authentication synchronization' });
  }
});

// POST /api/auth/login
// Retained for backward compatibility or simulated API calls
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Fetch user
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials or user not found' });
    }

    // Get corresponding profile (if any)
    let profile = null;
    if (user.role === 'student') {
      profile = await db.getStudentProfileByUserId(user.id);
    } else {
      profile = await db.getRecruiterProfileByUserId(user.id);
    }

    // Create a mock token for local auth context storage
    const token = `simulated-token:${user.email}:simulated-uid-${user.id}`;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      profile
    });
  } catch (error: any) {
    console.error('Error during login placeholder:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

export default router;

