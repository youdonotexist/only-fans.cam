import { User } from './models';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Get current user's profile
 * @param token JWT token
 * @returns Promise with user data
 */
export const getCurrentUser = async (token: string): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get user data');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get user error: ${error.message}`);
    }
    throw new Error('Failed to get user data');
  }
};

/**
 * Get user by ID
 * @param id User ID
 * @returns Promise with user data
 */
export const getUserById = async (id: number): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get user data');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get user error: ${error.message}`);
    }
    throw new Error('Failed to get user data');
  }
};

/**
 * Get user by username
 * @param username Username
 * @returns Promise with user data
 */
export const getUserByUsername = async (username: string): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/users/username/${encodeURIComponent(username)}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get user data');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get user by username error: ${error.message}`);
    }
    throw new Error('Failed to get user data');
  }
};

/**
 * Update current user's profile
 * @param userData User data to update
 * @param token JWT token
 * @returns Promise with updated user data
 */
export const updateUser = async (
  userData: Partial<User>, 
  token: string
): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Update user error: ${error.message}`);
    }
    throw new Error('Failed to update user');
  }
};

/**
 * Delete current user
 * @param token JWT token
 * @returns Promise with success message
 */
export const deleteUser = async (token: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete user');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Delete user error: ${error.message}`);
    }
    throw new Error('Failed to delete user');
  }
};

/**
 * Search users
 * @param searchTerm Search term
 * @returns Promise with array of users
 */
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/users?search=${encodeURIComponent(searchTerm)}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to search users');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Search users error: ${error.message}`);
    }
    throw new Error('Failed to search users');
  }
};

/**
 * Upload profile image
 * @param imageFile Image file to upload
 * @param token JWT token
 * @returns Promise with updated user data
 */
export const uploadProfileImage = async (
  imageFile: File,
  token: string
): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_URL}/users/me/profile-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload profile image');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Upload profile image error: ${error.message}`);
    }
    throw new Error('Failed to upload profile image');
  }
};

/**
 * Upload cover image
 * @param imageFile Image file to upload
 * @param token JWT token
 * @returns Promise with updated user data
 */
export const uploadCoverImage = async (
  imageFile: File,
  token: string
): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_URL}/users/me/cover-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload cover image');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Upload cover image error: ${error.message}`);
    }
    throw new Error('Failed to upload cover image');
  }
};