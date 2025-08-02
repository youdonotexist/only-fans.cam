import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/init';
import { auth } from '../middleware/auth';
import {Fan} from "../database/models";

// Define interfaces for database query results
interface CountResult {
  count: number;
}

const router = express.Router();

/**
 * @route   POST /api/fans
 * @desc    Create a new fan post
 * @access  Private
 */
router.post(
  '/',
  [
    auth,
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional(),
  ],
  async(req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;
    const db = getDatabase();

    db.run(
      'INSERT INTO fans (user_id, title, description) VALUES (?, ?, ?)',
      [req.user?.id, title, description],
      function (this: { lastID: number }, err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ message: 'Server error' });
        }

        const fanId = this.lastID;

        // Get the created fan with user info
        db.get(
          `SELECT f.*, u.username, u.profile_image as user_profile_image
           FROM fans f
           JOIN users u ON f.user_id = u.id
           WHERE f.id = ?`,
          [fanId],
          (err, fan) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ message: 'Server error' });
            }

            if (!fan) {
              return res.status(404).json({ message: 'Fan not found' });
            }

            res.status(201).json(fan);
          }
        );
      }
    );
  }
);

/**
 * @route   GET /api/fans
 * @desc    Get all fans with pagination
 * @access  Public
 */
router.get('/', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  const db = getDatabase();

  // Get total count
  db.get<CountResult>('SELECT COUNT(*) as count FROM fans', [], (err, result) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!result) {
      return res.status(500).json({ message: 'Failed to get count' });
    }

    const totalCount = result.count;
    const totalPages = Math.ceil(totalCount / limit);

    // Get fans with user info and media count
    db.all(
      `SELECT f.*, u.username, u.profile_image as user_profile_image,
              (SELECT COUNT(*) FROM media WHERE fan_id = f.id) as media_count,
              (SELECT COUNT(*) FROM likes WHERE fan_id = f.id) as likes_count
       FROM fans f
       JOIN users u ON f.user_id = u.id
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
      (err, fans) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ message: 'Server error' });
        }

        res.json({
          fans,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages,
          },
        });
      }
    );
  });
});

/**
 * @route   GET /api/fans/:id
 * @desc    Get a fan by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  const db = getDatabase();

  // Get fan with user info
  db.get(
    `SELECT f.*, u.username, u.profile_image as user_profile_image,
            (SELECT COUNT(*) FROM likes WHERE fan_id = f.id) as likes_count
     FROM fans f
     JOIN users u ON f.user_id = u.id
     WHERE f.id = ?`,
    [req.params.id],
    (err, fan) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!fan) {
        return res.status(404).json({ message: 'Fan not found' });
      }

      // Get media for this fan
      db.all(
        'SELECT * FROM media WHERE fan_id = ? ORDER BY created_at',
        [req.params.id],
        (err, media) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Server error' });
          }

          // Get comments for this fan
          db.all(
            `SELECT c.*, u.username, u.profile_image as user_profile_image
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.fan_id = ?
             ORDER BY c.created_at`,
            [req.params.id],
            (err, comments) => {
              if (err) {
                console.error(err.message);
                return res.status(500).json({ message: 'Server error' });
              }

              res.json({
                ...fan,
                media,
                comments,
              });
            }
          );
        }
      );
    }
  );
});

/**
 * @route   PUT /api/fans/:id
 * @desc    Update a fan
 * @access  Private
 */
router.put(
  '/:id',
  [
    auth,
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional(),
  ],
  async(req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;
    const db = getDatabase();

    // Check if fan exists and belongs to user
    db.get(
      'SELECT * FROM fans WHERE id = ?',
      [req.params.id],
      (err: Error, fan: Fan) => {

        if (err) {
          console.error(err.message);
          return res.status(500).json({ message: 'Server error' });
        }

        if (!fan) {
          return res.status(404).json({ message: 'Fan not found' });
        }

        if (fan.user_id !== req.user?.id) {
          return res.status(403).json({ message: 'Not authorized' });
        }

        // Build update fields
        const updateFields = [];
        const values = [];

        if (title) {
          updateFields.push('title = ?');
          values.push(title);
        }

        if (description !== undefined) {
          updateFields.push('description = ?');
          values.push(description);
        }

        if (updateFields.length === 0) {
          return res.status(400).json({ message: 'No fields to update' });
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');

        // Add fan ID to values array
        values.push(req.params.id);

        const query = `UPDATE fans SET ${updateFields.join(', ')} WHERE id = ?`;

        db.run(query, values, function (err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Server error' });
          }

          // Get updated fan
          db.get(
            `SELECT f.*, u.username, u.profile_image as user_profile_image
             FROM fans f
             JOIN users u ON f.user_id = u.id
             WHERE f.id = ?`,
            [req.params.id],
            (err, updatedFan) => {
              if (err) {
                console.error(err.message);
                return res.status(500).json({ message: 'Server error' });
              }

              if (!updatedFan) {
                return res.status(404).json({ message: 'Updated fan not found' });
              }

              res.json(updatedFan);
            }
          );
        });
      }
    );
  }
);

/**
 * @route   DELETE /api/fans/:id
 * @desc    Delete a fan
 * @access  Private
 */
router.delete('/:id', auth, (req, res) => {
  const db = getDatabase();

  // Check if fan exists and belongs to user
  db.get(
    'SELECT * FROM fans WHERE id = ?',
    [req.params.id],
    (err: Error, fan: Fan) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!fan) {
        return res.status(404).json({ message: 'Fan not found' });
      }

      if (fan.user_id !== req.user?.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      // Delete fan (cascade will delete associated media and comments)
      db.run('DELETE FROM fans WHERE id = ?', [req.params.id], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ message: 'Server error' });
        }

        res.json({ message: 'Fan deleted' });
      });
    }
  );
});

/**
 * @route   GET /api/fans/user/:userId
 * @desc    Get all fans by a specific user
 * @access  Public
 */
router.get('/user/:userId', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  const db = getDatabase();

  // Get total count for this user
  db.get<CountResult>(
    'SELECT COUNT(*) as count FROM fans WHERE user_id = ?',
    [req.params.userId],
    (err, result) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!result) {
        return res.status(500).json({ message: 'Failed to get count' });
      }

      const totalCount = result.count;
      const totalPages = Math.ceil(totalCount / limit);

      // Get fans with user info and media count
      db.all(
        `SELECT f.*, u.username, u.profile_image as user_profile_image,
                (SELECT COUNT(*) FROM media WHERE fan_id = f.id) as media_count,
                (SELECT COUNT(*) FROM likes WHERE fan_id = f.id) as likes_count
         FROM fans f
         JOIN users u ON f.user_id = u.id
         WHERE f.user_id = ?
         ORDER BY f.created_at DESC
         LIMIT ? OFFSET ?`,
        [req.params.userId, limit, offset],
        (err, fans) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Server error' });
          }

          res.json({
            fans,
            pagination: {
              page,
              limit,
              totalCount,
              totalPages,
            },
          });
        }
      );
    }
  );
});

/**
 * @route   POST /api/fans/:id/like
 * @desc    Like a fan
 * @access  Private
 */
router.post('/:id/like', auth, (req, res) => {
  const db = getDatabase();

  // Check if fan exists
  db.get('SELECT * FROM fans WHERE id = ?', [req.params.id], (err, fan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!fan) {
      return res.status(404).json({ message: 'Fan not found' });
    }

    // Check if already liked
    db.get(
      'SELECT * FROM likes WHERE user_id = ? AND fan_id = ?',
      [req.user?.id, req.params.id],
      (err, like) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ message: 'Server error' });
        }

        if (like) {
          return res.status(400).json({ message: 'Fan already liked' });
        }

        // Add like
        db.run(
          'INSERT INTO likes (user_id, fan_id) VALUES (?, ?)',
          [req.user?.id, req.params.id],
          function (err) {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ message: 'Server error' });
            }

            // Create notification for the fan owner
            db.get(
              'SELECT user_id, title FROM fans WHERE id = ?',
              [req.params.id],
              (err, fanInfo: { user_id: number, title: string }) => {
                if (err) {
                  console.error('Error getting fan info for notification:', err.message);
                  // Continue without creating notification
                } else if (fanInfo && fanInfo.user_id !== req.user?.id) {
                  // Only create notification if the liker is not the fan owner
                  db.get(
                    'SELECT username FROM users WHERE id = ?',
                    [req.user?.id],
                    (err, userInfo: { username: string }) => {
                      if (err || !userInfo) {
                        console.error('Error getting username for notification:', err?.message);
                        // Continue without creating notification
                      } else {
                        const message = `${userInfo.username} liked your post "${fanInfo.title}"`;
                        
                        // Insert notification
                        db.run(
                          'INSERT INTO notifications (user_id, fan_id, type, message, actor_id) VALUES (?, ?, ?, ?, ?)',
                          [fanInfo.user_id, req.params.id, 'like', message, req.user?.id],
                          (err) => {
                            if (err) {
                              console.error('Error creating notification:', err.message);
                              // Continue without notification
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );

            res.json({ message: 'Fan liked' });
          }
        );
      }
    );
  });
});

/**
 * @route   DELETE /api/fans/:id/like
 * @desc    Unlike a fan
 * @access  Private
 */
router.delete('/:id/like', auth, (req, res) => {
  const db = getDatabase();

  // Remove like
  db.run(
    'DELETE FROM likes WHERE user_id = ? AND fan_id = ?',
    [req.user?.id, req.params.id],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }

      if (this.changes === 0) {
        return res.status(400).json({ message: 'Fan not liked' });
      }

      res.json({ message: 'Fan unliked' });
    }
  );
});

/**
 * @route   POST /api/fans/:id/comment
 * @desc    Comment on a fan
 * @access  Private
 */
router.post(
  '/:id/comment',
  [
    auth,
    body('content').notEmpty().withMessage('Comment content is required'),
  ],
  async(req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;
    const db = getDatabase();

    // Check if fan exists
    db.get('SELECT * FROM fans WHERE id = ?', [req.params.id], (err, fan) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!fan) {
        return res.status(404).json({ message: 'Fan not found' });
      }

      // Add comment
      db.run(
        'INSERT INTO comments (user_id, fan_id, content) VALUES (?, ?, ?)',
        [req.user?.id, req.params.id, content],
        function (this: { lastID: number }, err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Server error' });
          }

          const commentId = this.lastID;

          // Get the created comment with user info
          db.get(
            `SELECT c.*, u.username, u.profile_image as user_profile_image
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.id = ?`,
            [commentId],
            (err, comment) => {
              if (err) {
                console.error(err.message);
                return res.status(500).json({ message: 'Server error' });
              }

              if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
              }

              // Create notification for the fan owner
              db.get(
                'SELECT user_id, title FROM fans WHERE id = ?',
                [req.params.id],
                (err, fanInfo: { user_id: number, title: string }) => {
                  if (err) {
                    console.error('Error getting fan info for notification:', err.message);
                    // Continue without creating notification
                  } else if (fanInfo && fanInfo.user_id !== req.user?.id) {
                    // Only create notification if the commenter is not the fan owner
                    db.get(
                      'SELECT username FROM users WHERE id = ?',
                      [req.user?.id],
                      (err, userInfo: { username: string }) => {
                        if (err || !userInfo) {
                          console.error('Error getting username for notification:', err?.message);
                          // Continue without creating notification
                        } else {
                          const message = `${userInfo.username} commented on your post "${fanInfo.title}"`;
                          
                          // Insert notification
                          db.run(
                            'INSERT INTO notifications (user_id, fan_id, type, message, actor_id) VALUES (?, ?, ?, ?, ?)',
                            [fanInfo.user_id, req.params.id, 'comment', message, req.user?.id],
                            (err) => {
                              if (err) {
                                console.error('Error creating notification:', err.message);
                                // Continue without notification
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );

              res.status(201).json(comment);
            }
          );
        }
      );
    });
  }
);

export const fanRoutes = router;
