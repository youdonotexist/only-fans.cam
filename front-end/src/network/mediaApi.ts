import {Media, UploadMediaResponse} from './models';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// CloudFront domain from environment variables (optional)
// If set, S3 URLs will be replaced with CloudFront URLs
// Example: https://d24u7zy2lxe3ij.cloudfront.net
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || 'https://d24u7zy2lxe3ij.cloudfront.net';

// Detect Android Chrome
const isAndroidChrome = /Android/i.test(navigator.userAgent) && /Chrome/i.test(navigator.userAgent);

/**
 * Upload media for a fan
 * @param fanId Fan ID
 * @param mediaFiles Files to upload
 * @param token JWT token
 * @returns Promise with uploaded media
 */
export const uploadMedia = async (
  fanId: number, 
  mediaFiles: File[], 
  token: string
): Promise<UploadMediaResponse> => {
  try {
      // Simplify FormData construction for Android
      const formData = new FormData();

      // For Android Chrome, use a simpler approach
      if (isAndroidChrome) {
          // Just append files with minimal information
          mediaFiles.forEach(file => {
              formData.append('media', file);
          });
      } else {
          // Use the more detailed approach for other browsers
          mediaFiles.forEach((file, index) => {
              const filename = file.name || `image_${index}.${file.type.split('/')[1] || 'jpg'}`;
              formData.append('media', file, filename);
          });
      }
    
    const response = await fetch(`${API_URL}/media/upload/${fanId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token
        // Explicitly remove Content-Type for FormData on Android Chrome
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload media');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Upload media error: ${error.message}`);
    }
    throw new Error('Failed to upload media');
  }
};

/**
 * Get media by ID
 * @param id Media ID
 * @returns Promise with media
 */
export const getMediaById = async (id: number): Promise<Media> => {
  try {
    const response = await fetch(`${API_URL}/media/${id}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch media');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get media error: ${error.message}`);
    }
    throw new Error('Failed to fetch media');
  }
};

/**
 * Get all media for a fan
 * @param fanId Fan ID
 * @returns Promise with media array
 */
export const getMediaByFan = async (fanId: number): Promise<Media[]> => {
  try {
    const response = await fetch(`${API_URL}/media/fan/${fanId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch fan media');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get fan media error: ${error.message}`);
    }
    throw new Error('Failed to fetch fan media');
  }
};

/**
 * Delete media
 * @param id Media ID
 * @param token JWT token
 * @returns Promise with success message
 */
export const deleteMedia = async (id: number, token: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/media/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete media');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Delete media error: ${error.message}`);
    }
    throw new Error('Failed to delete media');
  }
};

/**
 * Get full media URL
 * @param filePath File path or URL
 * @returns Full URL to media file
 */
export const getMediaUrl = (filePath: string): string => {
  // Handle undefined or null filePath
  if (!filePath) {
    console.warn('getMediaUrl called with undefined or null filePath');
    return '';
  }

  // If the path already starts with http, it's either an S3 URL or a full URL, so return it as is
  if (filePath.startsWith('http')) {
      const path = filePath.split('/').slice(3).join('/');
      return `${CLOUDFRONT_DOMAIN}/${path}`;
  }
  else {
    return `${CLOUDFRONT_DOMAIN}/${filePath}`;
  }
};