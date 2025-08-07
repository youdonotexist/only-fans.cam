import express from 'express';
import { getDatabase } from '../database/init';
import { FlaggedFan } from '../database/models';
import { auth } from '../middleware/auth';
import { Request, Response, NextFunction } from 'express';

// Admin middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists and has admin role
  // For now, we'll just check if the user ID is 1 (assuming ID 1 is admin)
  if (req.user && req.user.id === 1) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

const router = express.Router();

/**
 * Get all flagged fans
 * Admin only endpoint
 */
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const db = getDatabase();
    
    const flaggedFans = await new Promise<any[]>((resolve, reject) => {
      db.all(`
        SELECT 
          ff.id, 
          ff.fan_id, 
          ff.reporter_id, 
          ff.reason, 
          ff.status, 
          ff.created_at, 
          ff.updated_at,
          f.title as fan_title,
          u.username as reporter_username,
          u.profile_image as reporter_profile_image
        FROM flagged_fans ff
        JOIN fans f ON ff.fan_id = f.id
        JOIN users u ON ff.reporter_id = u.id
        ORDER BY ff.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json(flaggedFans);
  } catch (error) {
    console.error('Error fetching flagged fans:', error);
    res.status(500).json({ error: 'Failed to fetch flagged fans' });
  }
});

/**
 * Get a specific flagged fan by ID
 * Admin only endpoint
 */
router.get('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const flaggedFan = await new Promise<any>((resolve, reject) => {
      db.get(`
        SELECT 
          ff.id, 
          ff.fan_id, 
          ff.reporter_id, 
          ff.reason, 
          ff.status, 
          ff.created_at, 
          ff.updated_at,
          f.title as fan_title,
          f.description as fan_description,
          f.image_url as fan_image_url,
          u.username as reporter_username,
          u.profile_image as reporter_profile_image
        FROM flagged_fans ff
        JOIN fans f ON ff.fan_id = f.id
        JOIN users u ON ff.reporter_id = u.id
        WHERE ff.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!flaggedFan) {
      return res.status(404).json({ error: 'Flagged fan not found' });
    }
    
    res.json(flaggedFan);
  } catch (error) {
    console.error('Error fetching flagged fan:', error);
    res.status(500).json({ error: 'Failed to fetch flagged fan' });
  }
});

/**
 * Update a flagged fan status
 * Admin only endpoint
 */
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = getDatabase();
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: pending, approved, rejected' });
    }
    
    // Check if the flagged fan exists
    const existingFlaggedFan = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM flagged_fans WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!existingFlaggedFan) {
      return res.status(404).json({ error: 'Flagged fan not found' });
    }
    
    // Update the status
    await new Promise<void>((resolve, reject) => {
      db.run(`
        UPDATE flagged_fans
        SET status = ?, updated_at = ?
        WHERE id = ?
      `, [status, new Date().toISOString(), id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // If status is approved, delete the fan
    if (status === 'approved') {
      await new Promise<void>((resolve, reject) => {
        db.run('DELETE FROM fans WHERE id = ?', [existingFlaggedFan.fan_id], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    
    res.json({ message: 'Flagged fan status updated successfully' });
  } catch (error) {
    console.error('Error updating flagged fan status:', error);
    res.status(500).json({ error: 'Failed to update flagged fan status' });
  }
});

/**
 * Create a new flagged fan report
 * Authenticated endpoint
 */
router.post('/', auth, async (req, res) => {
  try {
    const { fan_id, reason } = req.body;
    const reporter_id = req.user?.id;
    const db = getDatabase();
    
    if (!reporter_id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!fan_id || !reason) {
      return res.status(400).json({ error: 'Fan ID and reason are required' });
    }
    
    // Check if the fan exists
    const fan = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM fans WHERE id = ?', [fan_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!fan) {
      return res.status(404).json({ error: 'Fan not found' });
    }
    
    // Check if the user has already reported this fan
    const existingReport = await new Promise<any>((resolve, reject) => {
      db.get(
        'SELECT * FROM flagged_fans WHERE fan_id = ? AND reporter_id = ?',
        [fan_id, reporter_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this fan' });
    }
    
    // Create the flagged fan report
    const result = await new Promise<any>((resolve, reject) => {
      db.run(`
        INSERT INTO flagged_fans (fan_id, reporter_id, reason, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [fan_id, reporter_id, reason, 'pending', new Date().toISOString(), new Date().toISOString()],
      function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID });
      });
    });
    
    res.status(201).json({ 
      message: 'Fan reported successfully',
      id: result.lastID
    });
  } catch (error) {
    console.error('Error reporting fan:', error);
    res.status(500).json({ error: 'Failed to report fan' });
  }
});

export default router;