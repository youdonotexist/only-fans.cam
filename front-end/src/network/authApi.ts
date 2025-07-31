import { RegisterRequest, RegisterResponse, User } from './models';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Register a new user
 * @param userData User registration data
 * @returns Promise with token
 */
export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Registration error: ${error.message}`);
    }
    throw new Error('Registration failed');
  }
};

/**
 * Login a user
 * @param email User email
 * @param password User password
 * @returns Promise with token
 */
export const login = async (email: string, password: string): Promise<{ token: string }> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Login error: ${error.message}`);
    }
    throw new Error('Login failed');
  }
};

/**
 * Get the current authenticated user
 * @param token JWT token
 * @returns Promise with user data
 */
export const getCurrentUserProtected = async (token: string): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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