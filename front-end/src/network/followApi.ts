import { FollowersResponse, FollowingResponse } from './models';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Follow a user
 * @param userId User ID to follow
 * @param token JWT token
 * @returns Promise with success message
 */
export const followUser = async (userId: number, token: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/follows/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to follow user');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Follow user error: ${error.message}`);
    }
    throw new Error('Failed to follow user');
  }
};

/**
 * Unfollow a user
 * @param userId User ID to unfollow
 * @param token JWT token
 * @returns Promise with success message
 */
export const unfollowUser = async (userId: number, token: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/follows/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to unfollow user');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Unfollow user error: ${error.message}`);
    }
    throw new Error('Failed to unfollow user');
  }
};

/**
 * Get followers of a user
 * @param userId User ID
 * @param page Page number
 * @param limit Items per page
 * @returns Promise with followers and pagination data
 */
export const getFollowers = async (userId: number, page = 1, limit = 10): Promise<FollowersResponse> => {
  try {
    const response = await fetch(`${API_URL}/follows/followers/${userId}?page=${page}&limit=${limit}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch followers');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get followers error: ${error.message}`);
    }
    throw new Error('Failed to fetch followers');
  }
};

/**
 * Get users that a user is following
 * @param userId User ID
 * @param page Page number
 * @param limit Items per page
 * @returns Promise with following users and pagination data
 */
export const getFollowing = async (userId: number, page = 1, limit = 10): Promise<FollowingResponse> => {
  try {
    const response = await fetch(`${API_URL}/follows/following/${userId}?page=${page}&limit=${limit}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch following');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get following error: ${error.message}`);
    }
    throw new Error('Failed to fetch following');
  }
};

/**
 * Check if current user is following another user
 * @param userId User ID to check
 * @param token JWT token
 * @returns Promise with boolean indicating if following
 */
export const checkIfFollowing = async (userId: number, token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/follows/check/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If 404, user is not following
      if (response.status === 404) {
        return false;
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check follow status');
    }

    const data = await response.json();
    return data.following;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Check following error: ${error.message}`);
    }
    throw new Error('Failed to check follow status');
  }
};