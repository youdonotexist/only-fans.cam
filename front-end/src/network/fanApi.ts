import { 
  Fan, 
  FanWithDetails, 
  CreateFanRequest, 
  UpdateFanRequest, 
  FansResponse, 
  CreateCommentRequest, 
  Comment 
} from './models';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Get all fans with pagination
 * @param page Page number
 * @param limit Items per page
 * @returns Promise with fans and pagination data
 */
export const getAllFans = async (page = 1, limit = 10): Promise<FansResponse> => {
  try {
    const response = await fetch(`${API_URL}/fans?page=${page}&limit=${limit}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch fans');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get fans error: ${error.message}`);
    }
    throw new Error('Failed to fetch fans');
  }
};

/**
 * Get a fan by ID
 * @param id Fan ID
 * @returns Promise with fan details
 */
export const getFanById = async (id: number): Promise<FanWithDetails> => {
  try {
    const response = await fetch(`${API_URL}/fans/${id}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch fan');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get fan error: ${error.message}`);
    }
    throw new Error('Failed to fetch fan');
  }
};

/**
 * Get all fans by a user
 * @param userId User ID
 * @param page Page number
 * @param limit Items per page
 * @returns Promise with fans and pagination data
 */
export const getFansByUser = async (userId: number, page = 1, limit = 10): Promise<FansResponse> => {
  try {
    const response = await fetch(`${API_URL}/fans/user/${userId}?page=${page}&limit=${limit}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user fans');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get user fans error: ${error.message}`);
    }
    throw new Error('Failed to fetch user fans');
  }
};

/**
 * Create a new fan
 * @param fanData Fan data
 * @param token JWT token
 * @returns Promise with created fan
 */
export const createFan = async (fanData: CreateFanRequest, token: string): Promise<Fan> => {
  try {
    const response = await fetch(`${API_URL}/fans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(fanData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create fan');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Create fan error: ${error.message}`);
    }
    throw new Error('Failed to create fan');
  }
};

/**
 * Update a fan
 * @param id Fan ID
 * @param fanData Fan data to update
 * @param token JWT token
 * @returns Promise with updated fan
 */
export const updateFan = async (id: number, fanData: UpdateFanRequest, token: string): Promise<Fan> => {
  try {
    const response = await fetch(`${API_URL}/fans/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(fanData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update fan');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Update fan error: ${error.message}`);
    }
    throw new Error('Failed to update fan');
  }
};

/**
 * Delete a fan
 * @param id Fan ID
 * @param token JWT token
 * @returns Promise with success message
 */
export const deleteFan = async (id: number, token: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/fans/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete fan');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Delete fan error: ${error.message}`);
    }
    throw new Error('Failed to delete fan');
  }
};

/**
 * Like a fan
 * @param id Fan ID
 * @param token JWT token
 * @returns Promise with success message
 */
export const likeFan = async (id: number, token: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/fans/${id}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to like fan');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Like fan error: ${error.message}`);
    }
    throw new Error('Failed to like fan');
  }
};

/**
 * Unlike a fan
 * @param id Fan ID
 * @param token JWT token
 * @returns Promise with success message
 */
export const unlikeFan = async (id: number, token: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/fans/${id}/like`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to unlike fan');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Unlike fan error: ${error.message}`);
    }
    throw new Error('Failed to unlike fan');
  }
};

/**
 * Add a comment to a fan
 * @param id Fan ID
 * @param commentData Comment data
 * @param token JWT token
 * @returns Promise with created comment
 */
export const addComment = async (id: number, commentData: CreateCommentRequest, token: string): Promise<Comment> => {
  try {
    const response = await fetch(`${API_URL}/fans/${id}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add comment');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Add comment error: ${error.message}`);
    }
    throw new Error('Failed to add comment');
  }
};