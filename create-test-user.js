const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api';

// Test user data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

// Register function
async function registerUser() {
  try {
    console.log('Registering test user...');
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('User registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    // If user already exists, try to login
    if (error.response?.data?.message === 'User already exists') {
      console.log('User already exists, trying to login...');
      return loginUser();
    }
    throw error;
  }
}

// Login function
async function loginUser() {
  try {
    console.log('Logging in...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await registerUser();
    console.log('Test user setup completed successfully');
  } catch (error) {
    console.error('Test user setup failed:', error.message);
  }
}

// Run the script
main();