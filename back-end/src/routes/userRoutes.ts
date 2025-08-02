import express, {Request, Response} from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/init';
import { auth } from '../middleware/auth';
import {User} from "../database/models";
import multer from 'multer';
import { uploadFileToS3 } from '../services/s3Service';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', auth, (req, res) => {
  const db = getDatabase();
  
  db.get(
    'SELECT id, username, email, bio, profile_image, cover_image, created_at FROM users WHERE id = ?',
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
    'SELECT id, username, bio, profile_image, cover_image, created_at FROM users WHERE id = ?',
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
        'SELECT id, username, email, bio, profile_image, cover_image, created_at, updated_at FROM users WHERE id = ?',
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

/**
 * @route   POST /api/users/me/profile-image
 * @desc    Upload profile image
 * @access  Private
 */
router.post('/me/profile-image', auth, upload.single('image'), async (req: Request, res: Response) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const db = getDatabase();
    
    let fileUrl = '';
    
    try {
      // Try to upload file to S3
      fileUrl = await uploadFileToS3(
        req.file.buffer,
        req.file.mimetype,
        'profile-images'
      );
    } catch (s3Error) {
      console.error('S3 upload failed, using fallback URL:', s3Error);
      // Fallback to a placeholder image URL if S3 upload fails
      fileUrl = `https://ui-avatars.com/api/?name=${req.user?.id}&background=random&size=200`;
    }
    
    console.log('Profile image URL to be saved:', fileUrl);
    
    // Update user's profile_image in database
    db.run(
      'UPDATE users SET profile_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [fileUrl, req.user?.id],
      function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ message: 'Server error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Return updated user
        db.get(
          'SELECT id, username, email, bio, profile_image, cover_image, created_at, updated_at FROM users WHERE id = ?',
          [req.user?.id],
          (err, user) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ message: 'Server error' });
            }
            
            res.json(user);
          }
        );
      }
    );
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Failed to upload profile image' });
  }
});

/**
 * @route   POST /api/users/me/cover-image
 * @desc    Upload cover image
 * @access  Private
 */
router.post('/me/cover-image', auth, upload.single('image'), async (req: Request, res: Response) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const db = getDatabase();
    
    let fileUrl = '';
    
    try {
      // Try to upload file to S3
      fileUrl = await uploadFileToS3(
        req.file.buffer,
        req.file.mimetype,
        'cover-images'
      );
    } catch (s3Error) {
      console.error('S3 upload failed, using fallback URL:', s3Error);
      // Fallback to a placeholder image URL if S3 upload fails
      fileUrl = `https://ui-avatars.com/api/?name=${req.user?.id}-cover&background=random&size=800x200`;
    }
    
    console.log('Cover image URL to be saved:', fileUrl);
    
    // Update user's cover_image in database
    db.run(
      'UPDATE users SET cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [fileUrl, req.user?.id],
      function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ message: 'Server error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Return updated user
        db.get(
          'SELECT id, username, email, bio, profile_image, cover_image, created_at, updated_at FROM users WHERE id = ?',
          [req.user?.id],
          (err, user) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ message: 'Server error' });
            }
            
            res.json(user);
          }
        );
      }
    );
  } catch (error) {
    console.error('Error uploading cover image:', error);
    res.status(500).json({ message: 'Failed to upload cover image' });
  }
});

export const userRoutes = router;