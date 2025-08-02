import express from 'express';
import { getDatabase } from '../database/init';
import { auth } from '../middleware/auth';

// Define interfaces for database query results
interface CountResult {
  count: number;
}

const router = express.Router();

/**
 * @route   POST /api/follows/:userId
 * @desc    Follow a user
 * @access  Private
 */
router.post('/:userId', auth, (req, res) => {
  const followingId = parseInt(req.params.userId);
  const followerId = req.user?.id;

  // Can't follow yourself
  if (followerId === followingId) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }

  const db = getDatabase();

  // Check if user to follow exists
  db.get('SELECT * FROM users WHERE id = ?', [followingId], (err, user) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    db.get(
      'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId],
      (err, follow) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ message: 'Server error' });
        }

        if (follow) {
          return res.status(400).json({ message: 'Already following this user' });
        }

        // Create follow relationship
        db.run(
          'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
          [followerId, followingId],
          function(err) {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ message: 'Server error' });
            }

            // Create notification for the user being followed
            db.get(
              'SELECT username FROM users WHERE id = ?',
              [followerId],
              (err, followerInfo) => {
                if (err) {
                  console.error('Error getting follower info for notification:', err.message);
                  // Continue without creating notification
                } else if (followerInfo) {
                  const message = `${followerInfo.username} started following you`;
                  
                  // Insert notification
                  db.run(
                    'INSERT INTO notifications (user_id, fan_id, type, message, actor_id) VALUES (?, ?, ?, ?, ?)',
                    [followingId, 0, 'follow', message, followerId],
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

            res.json({ message: 'User followed successfully' });
          }
        );
      }
    );
  });
});

/**
 * @route   DELETE /api/follows/:userId
 * @desc    Unfollow a user
 * @access  Private
 */
router.delete('/:userId', auth, (req, res) => {
  const followingId = parseInt(req.params.userId);
  const followerId = req.user?.id;

  const db = getDatabase();

  // Delete follow relationship
  db.run(
    'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
    [followerId, followingId],
    function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }

      if (this.changes === 0) {
        return res.status(400).json({ message: 'Not following this user' });
      }

      res.json({ message: 'User unfollowed successfully' });
    }
  );
});

/**
 * @route   GET /api/follows/followers/:userId
 * @desc    Get followers of a user
 * @access  Public
 */
router.get('/followers/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const db = getDatabase();

  // Check if user exists
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get total count of followers
    db.get<CountResult>(
      'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
      [userId],
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

        // Get followers with pagination
        db.all(
          `SELECT u.id, u.username, u.bio, u.profile_image, f.created_at as followed_at
           FROM follows f
           JOIN users u ON f.follower_id = u.id
           WHERE f.following_id = ?
           ORDER BY f.created_at DESC
           LIMIT ? OFFSET ?`,
          [userId, limit, offset],
          (err, followers) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ message: 'Server error' });
            }

            res.json({
              followers,
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
});

/**
 * @route   GET /api/follows/following/:userId
 * @desc    Get users that a user is following
 * @access  Public
 */
router.get('/following/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const db = getDatabase();

  // Check if user exists
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get total count of following
    db.get<CountResult>(
      'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
      [userId],
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

        // Get following with pagination
        db.all(
          `SELECT u.id, u.username, u.bio, u.profile_image, f.created_at as followed_at
           FROM follows f
           JOIN users u ON f.following_id = u.id
           WHERE f.follower_id = ?
           ORDER BY f.created_at DESC
           LIMIT ? OFFSET ?`,
          [userId, limit, offset],
          (err, following) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ message: 'Server error' });
            }

            res.json({
              following,
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
});

/**
 * @route   GET /api/follows/check/:userId
 * @desc    Check if current user is following a specific user
 * @access  Private
 */
router.get('/check/:userId', auth, (req, res) => {
  const followingId = parseInt(req.params.userId);
  const followerId = req.user?.id;

  const db = getDatabase();

  db.get(
    'SELECT * FROM follows WHERE follower_id = ? AND following_id = ?',
    [followerId, followingId],
    (err, follow) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }

      res.json({ isFollowing: !!follow });
    }
  );
});

export const followRoutes = router;
