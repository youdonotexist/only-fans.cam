import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/init';
import { auth } from '../middleware/auth';
import { Message, Conversation } from '../database/models';

// Define interfaces for database query results
interface CountResult {
  count: number;
}

const router = express.Router();

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations for the current user
 * @access  Private
 */
router.get('/conversations', auth, (req, res) => {
  const db = getDatabase();
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  
  // Get total count of conversations
  db.get<CountResult>(
    `SELECT COUNT(*) as count FROM conversations 
     WHERE user1_id = ? OR user2_id = ?`,
    [req.user?.id, req.user?.id],
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
      
      // Get conversations with user info and last message
      db.all(
        `SELECT c.*,
                u1.username as user1_username, u1.profile_image as user1_profile_image,
                u2.username as user2_username, u2.profile_image as user2_profile_image,
                m.content as last_message_content,
                (SELECT COUNT(*) FROM messages 
                 WHERE ((sender_id = c.user1_id AND recipient_id = c.user2_id) OR 
                        (sender_id = c.user2_id AND recipient_id = c.user1_id)) 
                       AND recipient_id = ? AND is_read = 0) as unread_count
         FROM conversations c
         JOIN users u1 ON c.user1_id = u1.id
         JOIN users u2 ON c.user2_id = u2.id
         LEFT JOIN messages m ON m.id = (
           SELECT id FROM messages 
           WHERE (sender_id = c.user1_id AND recipient_id = c.user2_id) OR 
                 (sender_id = c.user2_id AND recipient_id = c.user1_id)
           ORDER BY created_at DESC LIMIT 1
         )
         WHERE c.user1_id = ? OR c.user2_id = ?
         ORDER BY c.last_message_at DESC
         LIMIT ? OFFSET ?`,
        [req.user?.id, req.user?.id, req.user?.id, limit, offset],
        (err, conversations) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Server error' });
          }
          
          res.json({
            conversations,
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
 * @route   GET /api/messages/:userId
 * @desc    Get messages between current user and specified user
 * @access  Private
 */
router.get('/:userId', auth, (req, res) => {
  const db = getDatabase();
  const otherUserId = parseInt(req.params.userId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = (page - 1) * limit;
  
  // Validate other user exists
  db.get('SELECT id FROM users WHERE id = ?', [otherUserId], (err, user) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get total count of messages
    db.get<CountResult>(
      `SELECT COUNT(*) as count FROM messages 
       WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)`,
      [req.user?.id, otherUserId, otherUserId, req.user?.id],
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
        
        // Get messages with user info
        db.all(
          `SELECT m.*,
                  s.username as sender_username, s.profile_image as sender_profile_image,
                  r.username as recipient_username, r.profile_image as recipient_profile_image
           FROM messages m
           JOIN users s ON m.sender_id = s.id
           JOIN users r ON m.recipient_id = r.id
           WHERE (m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?)
           ORDER BY m.created_at DESC
           LIMIT ? OFFSET ?`,
          [req.user?.id, otherUserId, otherUserId, req.user?.id, limit, offset],
          (err, messages) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ message: 'Server error' });
            }
            
            // Mark messages as read
            db.run(
              'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND recipient_id = ? AND is_read = 0',
              [otherUserId, req.user?.id],
              (err) => {
                if (err) {
                  console.error('Error marking messages as read:', err.message);
                  // Continue without error
                }
                
                res.json({
                  messages,
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
      }
    );
  });
});

/**
 * @route   POST /api/messages/:userId
 * @desc    Send a message to a user
 * @access  Private
 */
router.post(
  '/:userId',
  [
    auth,
    body('content').notEmpty().withMessage('Message content is required'),
  ],
  async(req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { content } = req.body;
    const recipientId = parseInt(req.params.userId);
    const db = getDatabase();
    
    // Can't message yourself
    if (req.user?.id === recipientId) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }
    
    // Validate recipient exists
    db.get('SELECT id FROM users WHERE id = ?', [recipientId], (err, user) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!user) {
        return res.status(404).json({ message: 'Recipient not found' });
      }
      
      // Insert message
      db.run(
        'INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)',
        [req.user?.id, recipientId, content],
        function (this: { lastID: number }, err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Server error' });
          }
          
          const messageId = this.lastID;
          
          // Get the created message with user info
          db.get(
            `SELECT m.*,
                    s.username as sender_username, s.profile_image as sender_profile_image,
                    r.username as recipient_username, r.profile_image as recipient_profile_image
             FROM messages m
             JOIN users s ON m.sender_id = s.id
             JOIN users r ON m.recipient_id = r.id
             WHERE m.id = ?`,
            [messageId],
            (err, message) => {
              if (err) {
                console.error(err.message);
                return res.status(500).json({ message: 'Server error' });
              }
              
              if (!message) {
                return res.status(404).json({ message: 'Message not found' });
              }
              
              // Update or create conversation
              const user1Id = Math.min(req.user?.id as number, recipientId);
              const user2Id = Math.max(req.user?.id as number, recipientId);
              
              db.get(
                'SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?',
                [user1Id, user2Id],
                (err, conversation: { id: number }) => {
                  if (err) {
                    console.error(err.message);
                    // Continue without error
                  }
                  
                  if (conversation) {
                    // Update existing conversation
                    db.run(
                      'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?',
                      [conversation.id],
                      (err) => {
                        if (err) {
                          console.error('Error updating conversation:', err.message);
                          // Continue without error
                        }
                        
                        res.status(201).json(message);
                      }
                    );
                  } else {
                    // Create new conversation
                    db.run(
                      'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
                      [user1Id, user2Id],
                      (err) => {
                        if (err) {
                          console.error('Error creating conversation:', err.message);
                          // Continue without error
                        }
                        
                        res.status(201).json(message);
                      }
                    );
                  }
                }
              );
            }
          );
        }
      );
    });
  }
);

/**
 * @route   GET /api/messages/unread/count
 * @desc    Get count of unread messages
 * @access  Private
 */
router.get('/unread/count', auth, (req, res) => {
  const db = getDatabase();
  
  db.get<CountResult>(
    'SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND is_read = 0',
    [req.user?.id],
    (err, result) => {
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

export const messageRoutes = router;