import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Protect all admin endpoints
router.use(authenticateToken);
router.use(requireRole('admin'));

// GET /api/admin/users
// Get all users with role and full name
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (error: any) {
    console.error('Error in GET /api/admin/users:', error);
    res.status(500).json({ error: 'Server error retrieving users list' });
  }
});

// POST /api/admin/users
// Admin can create a new user with any role
router.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, password, role, fullName } = req.body;

    if (!email || !password || !role || !fullName) {
      return res.status(400).json({ error: 'Email, password, role, and fullName are required' });
    }

    if (role !== 'student' && role !== 'recruiter' && role !== 'admin') {
      return res.status(400).json({ error: 'Role must be student, recruiter, or admin' });
    }

    // Check if user already exists
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create the user
    const user = await db.createUser(email, password, role);

    // Create corresponding profiles
    if (role === 'student') {
      await db.createOrUpdateStudentProfile(
        user.id,
        fullName,
        'Frontend Engineer',
        '', // github
        '', // linkedin
        true, // certificates
        false // dsa
      );
    } else if (role === 'recruiter') {
      await db.createOrUpdateRecruiterProfile(
        user.id,
        fullName,
        'Company Name',
        '', // website
        'Technology'
      );
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/users:', error);
    res.status(500).json({ error: error.message || 'Server error creating user' });
  }
});

// DELETE /api/admin/users/:id
// Admin can delete a user by ID
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    await db.deleteUser(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/users/:id:', error);
    res.status(500).json({ error: 'Server error deleting user' });
  }
});

export default router;
