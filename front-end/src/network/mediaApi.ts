import { Media, UploadMediaResponse } from './models';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

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
    const formData = new FormData();
    
    // Append each file to the form data
    mediaFiles.forEach(file => {
      formData.append('media', file);
    });
    
    const response = await fetch(`${API_URL}/media/upload/${fanId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
      body: formData,
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
 * @param filePath Relative file path
 * @returns Full URL to media file
 */
export const getMediaUrl = (filePath: string): string => {
  // If the path already starts with http, return it as is
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  
  // Construct the full URL
  return `${API_URL.replace('/api', '')}/${cleanPath}`;
};