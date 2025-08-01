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

// Create a fan post
async function createFanPost() {
  try {
    if (!authToken) {
      throw new Error('Not authenticated. Please login first.');
    }

    console.log('Creating fan post...');
    
    const fanData = {
      title: 'Test Fan with S3 Image',
      description: 'This is a test fan post with an image uploaded to S3'
    };
    
    const response = await axios.post(
      `${API_URL}/fans`,
      fanData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    console.log('Fan post created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fan post creation failed:', error.response?.data || error.message);
    throw error;
  }
}

// Upload image for a fan post
async function uploadFanImage(fanId) {
  try {
    if (!authToken) {
      throw new Error('Not authenticated. Please login first.');
    }

    console.log('Uploading fan image...');
    
    // Create a sample image if needed (you can replace this with an actual image path)
    const sampleImagePath = path.join(__dirname, 'sample-profile.jpg');
    
    // Check if the sample image exists
    if (!fs.existsSync(sampleImagePath)) {
      console.log('Sample image not found. Please provide a valid image path.');
      return;
    }
    
    const formData = new FormData();
    formData.append('media', fs.createReadStream(sampleImagePath));
    
    const response = await axios.post(
      `${API_URL}/media/upload/${fanId}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    console.log('Fan image upload successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fan image upload failed:', error.response?.data || error.message);
    // Log more detailed error information
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Get fan details to verify image URL
async function getFanDetails(fanId) {
  try {
    console.log(`Getting details for fan ID ${fanId}...`);
    
    const response = await axios.get(`${API_URL}/fans/${fanId}`);
    
    console.log('Fan details retrieved successfully');
    console.log('Media items:', response.data.media);
    
    if (response.data.media && response.data.media.length > 0) {
      console.log('Image URL:', response.data.media[0].file_path);
      // Verify if it's an S3 URL
      if (response.data.media[0].file_path.includes('amazonaws.com')) {
        console.log('SUCCESS: Image is stored on AWS S3');
      } else {
        console.log('WARNING: Image does not appear to be stored on AWS S3');
      }
    } else {
      console.log('No media found for this fan');
    }
    
    return response.data;
  } catch (error) {
    console.error('Failed to get fan details:', error.response?.data || error.message);
    throw error;
  }
}

// Main function to run the tests
async function runTests() {
  try {
    // Login
    await login();
    
    // Create a fan post
    const fan = await createFanPost();
    console.log(`Created fan with ID: ${fan.id}`);
    
    // Upload an image for the fan
    const mediaUpload = await uploadFanImage(fan.id);
    console.log('Media upload response:', mediaUpload);
    
    // Get fan details to verify the image URL
    await getFanDetails(fan.id);
    
    console.log('All tests completed successfully');
  } catch (error) {
    console.error('Tests failed:', error.message);
  }
}

// Run the tests
runTests();