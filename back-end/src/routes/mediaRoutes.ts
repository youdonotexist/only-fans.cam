import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDatabase } from '../database/init';
import { auth } from '../middleware/auth';
import {Fan, Media} from "../database/models";
import { uploadFileToS3, deleteFileFromS3 } from '../services/s3Service';

// Extended Media interface that includes user_id from the joined fans table
interface MediaWithUser extends Media {
  user_id: number;
}

const router = express.Router();

// Use memory storage for multer since we'll be uploading to S3
const storage = multer.memoryStorage();

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
router.post('/upload/:fanId', auth, upload.array('media', 5), async (req, res) => {
  const fanId = parseInt(req.params.fanId);
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  
  const db = getDatabase();
  
  try {
    // Check if fan exists and belongs to user
    const fanPromise = new Promise<Fan>((resolve, reject) => {
      db.get('SELECT * FROM fans WHERE id = ?', [fanId], (err: Error, fan: Fan) => {
        if (err) {
          console.error(err.message);
          reject(new Error('Server error'));
        } else if (!fan) {
          reject(new Error('Fan not found'));
        } else if (fan.user_id !== req.user?.id) {
          reject(new Error('Not authorized'));
        } else {
          resolve(fan);
        }
      });
    });
    
    // Wait for fan check to complete
    await fanPromise;
    
    // Upload files to S3 and insert media records
    const mediaRecords: Media[] = [];
    const uploadPromises = files.map(async (file) => {
      try {
        // Determine file type
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
        const folder = `fan-media/${fanId}`;
        
        // Upload file to S3
        const s3Url = await uploadFileToS3(
          file.buffer,
          file.mimetype,
          folder
        );
        
        // Insert media record with S3 URL
        return new Promise<void>((resolve, reject) => {
          db.run(
            'INSERT INTO media (fan_id, file_path, file_type) VALUES (?, ?, ?)',
            [fanId, s3Url, fileType],
            function(err) {
              if (err) {
                console.error('Error inserting media record:', err.message);
                reject(err);
              } else {
                mediaRecords.push({
                  id: this.lastID,
                  fan_id: fanId,
                  file_path: s3Url,
                  file_type: fileType,
                } as Media);
                resolve();
              }
            }
          );
        });
      } catch (error) {
        console.error('Error processing file:', error);
        throw error;
      }
    });
    
    // Wait for all uploads to complete
    await Promise.all(uploadPromises);
    
    // Return success response
    res.status(201).json({
      message: 'Media uploaded successfully',
      media: mediaRecords,
    });
  } catch (error) {
    console.error('Error in media upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    res.status(errorMessage === 'Fan not found' ? 404 : 
               errorMessage === 'Not authorized' ? 403 : 500)
       .json({ message: errorMessage });
  }
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
router.delete('/:id', auth, async (req, res) => {
  const mediaId = parseInt(req.params.id);
  const db = getDatabase();
  
  try {
    // Get media to check ownership and get file path
    const mediaPromise = new Promise<MediaWithUser>((resolve, reject) => {
      db.get(
        `SELECT m.*, f.user_id 
         FROM media m
         JOIN fans f ON m.fan_id = f.id
         WHERE m.id = ?`,
        [mediaId],
        (err: Error, media: MediaWithUser) => {
          if (err) {
            console.error(err.message);
            reject(new Error('Server error'));
          } else if (!media) {
            reject(new Error('Media not found'));
          } else if (media.user_id !== req.user?.id) {
            reject(new Error('Not authorized'));
          } else {
            resolve(media);
          }
        }
      );
    });
    
    // Wait for media check to complete
    const media: MediaWithUser = await mediaPromise;
    
    // Delete file from S3 if it's an S3 URL
    if (media.file_path && media.file_path.startsWith('http')) {
      try {
        await deleteFileFromS3(media.file_path);
      } catch (s3Error) {
        console.error('Error deleting file from S3:', s3Error);
        // Continue with deletion of database record even if S3 deletion fails
      }
    }
    
    // Delete media record
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM media WHERE id = ?', [mediaId], function(err) {
        if (err) {
          console.error(err.message);
          reject(new Error('Server error'));
        } else {
          resolve();
        }
      });
    });
    
    res.json({ message: 'Media deleted' });
  } catch (error) {
    console.error('Error in media deletion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    res.status(errorMessage === 'Media not found' ? 404 : 
               errorMessage === 'Not authorized' ? 403 : 500)
       .json({ message: errorMessage });
  }
});

/**
 * @route   GET /api/media/serve/:filename
 * @desc    Redirect to S3 URL or serve local file as fallback
 * @access  Public
 */
router.get('/serve/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // Check if the filename is actually an S3 URL (might be passed from legacy code)
  if (filename.startsWith('http')) {
    return res.redirect(filename);
  }
  
  // For S3 paths that might be stored without the full URL
  if (filename.includes('s3.amazonaws.com')) {
    return res.redirect(`https://${filename}`);
  }
  
  // Fallback to local file (for backward compatibility)
  const filePath = path.resolve(__dirname, '../../../uploads', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      message: 'File not found',
      note: 'This endpoint is deprecated. Files are now stored in S3.'
    });
  }
  
  res.sendFile(filePath);
});

export const mediaRoutes = router;