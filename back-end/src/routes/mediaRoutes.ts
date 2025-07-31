import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDatabase } from '../database/init';
import { auth } from '../middleware/auth';
import {Fan, Media} from "../database/models";

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, '../../../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'));
  }
};

// Configure upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

/**
 * @route   POST /api/media/upload/:fanId
 * @desc    Upload media for a fan
 * @access  Private
 */
router.post('/upload/:fanId', auth, upload.array('media', 5), (req, res) => {
  const fanId = parseInt(req.params.fanId);
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  
  const db = getDatabase();
  
  // Check if fan exists and belongs to user
  db.get('SELECT * FROM fans WHERE id = ?', [fanId], (err: Error, fan: Fan) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (!fan) {
      // Delete uploaded files if fan doesn't exist
      files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(404).json({ message: 'Fan not found' });
    }
    
    if (fan.user_id !== req.user?.id) {
      // Delete uploaded files if user doesn't own the fan
      files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Insert media records
    const mediaRecords: Media[] = [];
    
    for (const file of files) {
      const filePath = file.path.replace(path.resolve(__dirname, '../../../'), '');
      const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
      
      db.run(
        'INSERT INTO media (fan_id, file_path, file_type) VALUES (?, ?, ?)',
        [fanId, filePath, fileType],
        function(err) {
          if (err) {
            console.error(err.message);
            // Continue with other files even if one fails
          } else {
            mediaRecords.push({
              id: this.lastID,
              fan_id: fanId,
              file_path: filePath,
              file_type: fileType,
            } as Media);
          }
          
          // If all files processed, return response
          if (mediaRecords.length === files.length || mediaRecords.length + 1 === files.length) {
            res.status(201).json({
              message: 'Media uploaded successfully',
              media: mediaRecords,
            });
          }
        }
      );
    }
  });
});

/**
 * @route   GET /api/media/:id
 * @desc    Get media by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  const mediaId = parseInt(req.params.id);
  const db = getDatabase();
  
  db.get('SELECT * FROM media WHERE id = ?', [mediaId], (err, media) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    res.json(media);
  });
});

/**
 * @route   GET /api/media/fan/:fanId
 * @desc    Get all media for a fan
 * @access  Public
 */
router.get('/fan/:fanId', (req, res) => {
  const fanId = parseInt(req.params.fanId);
  const db = getDatabase();
  
  db.all(
    'SELECT * FROM media WHERE fan_id = ? ORDER BY created_at',
    [fanId],
    (err, media) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.json(media);
    }
  );
});

/**
 * @route   DELETE /api/media/:id
 * @desc    Delete media
 * @access  Private
 */
router.delete('/:id', auth, (req, res) => {
  const mediaId = parseInt(req.params.id);
  const db = getDatabase();
  
  // Get media to check ownership and get file path
  db.get(
    `SELECT m.*, f.user_id 
     FROM media m
     JOIN fans f ON m.fan_id = f.id
     WHERE m.id = ?`,
    [mediaId],
    (err: Error, media: Media) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!media) {
        return res.status(404).json({ message: 'Media not found' });
      }
      
      if (media.fan_id !== req.user?.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      // Delete file from filesystem
      const filePath = path.resolve(__dirname, '../../../', media.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete media record
      db.run('DELETE FROM media WHERE id = ?', [mediaId], function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ message: 'Server error' });
        }
        
        res.json({ message: 'Media deleted' });
      });
    }
  );
});

/**
 * @route   GET /api/media/serve/:filename
 * @desc    Serve media file
 * @access  Public
 */
router.get('/serve/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.resolve(__dirname, '../../../uploads', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }
  
  res.sendFile(filePath);
});

export const mediaRoutes = router;