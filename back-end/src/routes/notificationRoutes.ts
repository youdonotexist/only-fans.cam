import express, { Request, Response } from 'express';
import { getDatabase } from '../database/init';
import { auth } from '../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get current user's notifications
 * @access  Private
 */
router.get('/', auth, (req, res) => {
  const db = getDatabase();
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  
  // Get total count of notifications
  db.get(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
    [req.user?.id],
    (err, result: { count: number } | undefined) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!result) {
        return res.status(500).json({ message: 'Failed to get count' });
      }
      
      const totalCount = result.count;
      const totalPages = Math.ceil(totalCount / limit);
      
      // Get notifications with user and fan info
      db.all(
        `SELECT n.*, 
                u.username as actor_username, 
                u.profile_image as actor_profile_image,
                f.title as fan_title
         FROM notifications n
         LEFT JOIN users u ON n.actor_id = u.id
         LEFT JOIN fans f ON n.fan_id = f.id
         WHERE n.user_id = ?
         ORDER BY n.created_at DESC
         LIMIT ? OFFSET ?`,
        [req.user?.id, limit, offset],
        (err, notifications) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Server error' });
          }
          
          res.json({
            notifications,
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
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put('/:id/read', auth, (req, res) => {
  const db = getDatabase();
  const notificationId = parseInt(req.params.id);
  
  // Check if notification exists and belongs to user
  db.get(
    'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
    [notificationId, req.user?.id],
    (err, notification) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      // Mark notification as read
      db.run(
        'UPDATE notifications SET is_read = 1 WHERE id = ?',
        [notificationId],
        function(err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Server error' });
          }
          
          res.json({ message: 'Notification marked as read' });
        }
      );
    }
  );
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', auth, (req, res) => {
  const db = getDatabase();
  
  // Mark all notifications as read
  db.run(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
    [req.user?.id],
    function(err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.json({ 
        message: 'All notifications marked as read',
        count: this.changes
      });
    }
  );
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
router.get('/unread-count', auth, (req, res) => {
  const db = getDatabase();
  
  db.get(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [req.user?.id],
    (err, result: { count: number } | undefined) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!result) {
        return res.status(500).json({ message: 'Failed to get count' });
      }
      
      res.json({ count: result.count });
    }
  );
});

export const notificationRoutes = router;