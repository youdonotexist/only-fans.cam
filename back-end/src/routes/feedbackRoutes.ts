import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/init';
import { auth } from '../middleware/auth';

const router = express.Router();

// Admin middleware to check if user is an admin
const adminAuth = async (req: Request, res: Response, next: Function) => {
  // First run the regular auth middleware
  auth(req, res, async () => {
    try {
      // Check if user exists and is admin
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const db = getDatabase();
      
      db.get(
        'SELECT is_admin FROM users WHERE id = ?',
        [req.user.id],
        (err, user: { is_admin: number } | undefined) => {
          if (err) {
            console.error('Error checking admin status:', err.message);
            return res.status(500).json({ message: 'Server error' });
          }
          
          if (!user || user.is_admin !== 1) {
            return res.status(403).json({ message: 'Access denied. Admin role required.' });
          }
          
          // User is admin, proceed
          next();
        }
      );
    } catch (err) {
      console.error('Admin auth error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

/**
 * POST /api/feedback
 * Submit feedback or bug report
 * Public (can be submitted by anyone, even without login)
 */
router.post(
  '/',
  [
    // Validation middleware
    body('type').isIn(['feedback', 'bug']).withMessage('Type must be either "feedback" or "bug"'),
    body('title').notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
    body('description').notEmpty().withMessage('Description is required').isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  ],
  async (req: Request, res: Response) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, title, description } = req.body;
    const db = getDatabase();
    
    try {
      // Get user ID if authenticated
      let userId = null;
      if (req.headers.authorization || req.headers['x-auth-token']) {
        try {
          // Use auth middleware to get user ID
          auth(req, res, () => {
            if (req.user && req.user.id) {
              userId = req.user.id;
            }
          });
        } catch (authErr) {
          // If auth fails, continue without user ID
          console.log('User not authenticated, continuing with anonymous feedback');
        }
      }
      
      // Insert feedback into database
      db.run(
        'INSERT INTO feedback (user_id, type, title, description) VALUES (?, ?, ?, ?)',
        [userId, type, title, description],
        function(err) {
          if (err) {
            console.error('Error submitting feedback:', err.message);
            return res.status(500).json({ message: 'Server error' });
          }
          
          res.status(201).json({ 
            message: 'Feedback submitted successfully',
            id: this.lastID
          });
        }
      );
    } catch (err) {
      console.error('Error in feedback submission:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * GET /api/feedback
 * Get all feedback (admin only)
 * Private (Admin)
 */
router.get('/', adminAuth, async (req: Request, res: Response) => {
  const db = getDatabase();
  
  try {
    // Get query parameters for filtering
    const { status, type } = req.query;
    
    let query = `
      SELECT f.*, u.username, u.email 
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
    `;
    
    const queryParams = [];
    
    // Add filters if provided
    if (status || type) {
      query += ' WHERE';
      
      if (status) {
        query += ' f.status = ?';
        queryParams.push(status);
      }
      
      if (type) {
        if (status) query += ' AND';
        query += ' f.type = ?';
        queryParams.push(type);
      }
    }
    
    // Order by most recent first
    query += ' ORDER BY f.created_at DESC';
    
    db.all(query, queryParams, (err, feedback) => {
      if (err) {
        console.error('Error fetching feedback:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.json({ feedback });
    });
  } catch (err) {
    console.error('Error in feedback retrieval:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/feedback/:id
 * Get feedback by ID (admin only)
 * Private (Admin)
 */
router.get('/:id', adminAuth, async (req: Request, res: Response) => {
  const db = getDatabase();
  
  try {
    db.get(
      `SELECT f.*, u.username, u.email 
       FROM feedback f
       LEFT JOIN users u ON f.user_id = u.id
       WHERE f.id = ?`,
      [req.params.id],
      (err, feedback) => {
        if (err) {
          console.error('Error fetching feedback:', err.message);
          return res.status(500).json({ message: 'Server error' });
        }
        
        if (!feedback) {
          return res.status(404).json({ message: 'Feedback not found' });
        }
        
        res.json(feedback);
      }
    );
  } catch (err) {
    console.error('Error in feedback retrieval:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/feedback/:id
 * Update feedback status (admin only)
 * Private (Admin)
 */
router.put(
  '/:id',
  [
    adminAuth,
    body('status').isIn(['pending', 'in-progress', 'resolved', 'rejected']).withMessage('Invalid status')
  ],
  async (req: Request, res: Response) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const db = getDatabase();
    
    try {
      db.run(
        'UPDATE feedback SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, req.params.id],
        function(err) {
          if (err) {
            console.error('Error updating feedback:', err.message);
            return res.status(500).json({ message: 'Server error' });
          }
          
          if (this.changes === 0) {
            return res.status(404).json({ message: 'Feedback not found' });
          }
          
          res.json({ message: 'Feedback updated successfully' });
        }
      );
    } catch (err) {
      console.error('Error in feedback update:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export const feedbackRoutes = router;