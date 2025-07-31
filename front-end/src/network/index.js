// JavaScript implementation of the network functions
// This file provides the necessary functions for authentication

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Register a new user
 * @param userData User registration data
 * @returns Promise with token
 */
export const register = async (userData) => {
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
export const login = async (email, password) => {
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
