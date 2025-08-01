const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:3000/api';
let authToken = '';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

// Login function
async function login() {
  try {
    console.log('Logging in...');
    const response = await axios.post(`${API_URL}/auth/login`, testUser);
    authToken = response.data.token;
    console.log('Login successful, token received');
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Upload profile image function
async function uploadProfileImage() {
  try {
    if (!authToken) {
      throw new Error('Not authenticated. Please login first.');
    }

    console.log('Uploading profile image...');
    
    // Create a sample image if needed (you can replace this with an actual image path)
    const sampleImagePath = path.join(__dirname, 'sample-profile.jpg');
    
    // Check if the sample image exists
    if (!fs.existsSync(sampleImagePath)) {
      console.log('Sample image not found. Please provide a valid image path.');
      return;
    }
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(sampleImagePath));
    
    const response = await axios.post(
      `${API_URL}/users/me/profile-image`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    console.log('Profile image upload successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Profile image upload failed:', error.response?.data || error.message);
    // Log more detailed error information
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Main function to run the tests
async function runTests() {
  try {
    await login();
    await uploadProfileImage();
    console.log('All tests completed successfully');
  } catch (error) {
    console.error('Tests failed:', error.message);
  }
}

// Run the tests
runTests();