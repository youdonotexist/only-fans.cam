import express, {Request, Response} from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/init';
import { auth } from '../middleware/auth';
import {User} from "../database/models";

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', auth, (req, res) => {
  const db = getDatabase();
  
  db.get(
    'SELECT id, username, email, bio, profile_image, created_at FROM users WHERE id = ?',
    [req.user?.id],
    (err, user) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    }
  );
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  const db = getDatabase();
  
  db.get(
    'SELECT id, username, bio, profile_image, created_at FROM users WHERE id = ?',
    [req.params.id],
    (err, user) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    }
  );
});

/**
 * @route   PUT /api/users/me
 * @desc    Update current user's profile
 * @access  Private
 */
router.put(
  '/me',
  [
    auth,
    body('username').optional().notEmpty().withMessage('Username cannot be empty'),
    body('email').optional().isEmail().withMessage('Please include a valid email'),
    body('bio').optional(),
    body('profile_image').optional(),
  ],
  async(req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { username, email, bio, profile_image } : User = req.body;
    const db = getDatabase();
    
    // Build update fields
    const updateFields = [];
    const values = [];
    
    if (username) {
      updateFields.push('username = ?');
      values.push(username);
    }
    
    if (email) {
      updateFields.push('email = ?');
      values.push(email);
    }
    
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      values.push(bio);
    }
    
    if (profile_image !== undefined) {
      updateFields.push('profile_image = ?');
      values.push(profile_image);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add user ID to values array
    values.push(req.user?.id);
    
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    
    db.run(query, values, function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return updated user
      db.get(
        'SELECT id, username, email, bio, profile_image, created_at, updated_at FROM users WHERE id = ?',
        [req.user?.id],
        (err, user) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Server error' });
          }
          
          res.json(user);
        }
      );
    });
  }
);

/**
 * @route   DELETE /api/users/me
 * @desc    Delete current user
 * @access  Private
 */
router.delete('/me', auth, (req, res) => {
  const db = getDatabase();
  
  db.run('DELETE FROM users WHERE id = ?', [req.user?.id], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted' });
  });
});

/**
 * @route   GET /api/users
 * @desc    Search users
 * @access  Public
 */
router.get('/', (req, res) => {
  const { search } = req.query;
  const db = getDatabase();
  
  let query = 'SELECT id, username, bio, profile_image FROM users';
  const params = [];
  
  if (search) {
    query += ' WHERE username LIKE ?';
    params.push(`%${search}%`);
  }
  
  query += ' LIMIT 20';
  
  db.all(query, params, (err, users) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Server error' });
    }
    
    res.json(users);
  });
});

export const userRoutes = router;