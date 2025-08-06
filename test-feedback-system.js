const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:3000/api';
let authToken = null;
let userId = null;
let feedbackId = null;

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

// Admin user credentials
const adminUser = {
  email: 'youdonotexist@gmail.com',
  password: 'password123'
};

// Function to log results
function log(message, isError = false) {
  if (isError) {
    console.error(`❌ ${message}`);
  } else {
    console.log(`✅ ${message}`);
  }
}

// Login function
async function login(user) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    authToken = data.token;
    
    // Extract user ID from token (assuming JWT)
    const tokenParts = authToken.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      userId = payload.user.id;
    }
    
    log(`Logged in successfully with user ID: ${userId}`);
    return true;
  } catch (error) {
    log(`Login error: ${error.message}`, true);
    return false;
  }
}

// Submit feedback
async function submitFeedback(feedbackData) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add authorization header if token exists
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
      headers['x-auth-token'] = authToken;
    }
    
    const response = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers,
      body: JSON.stringify(feedbackData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit feedback');
    }
    
    const data = await response.json();
    feedbackId = data.id;
    
    log(`Feedback submitted successfully with ID: ${feedbackId}`);
    return data;
  } catch (error) {
    log(`Error submitting feedback: ${error.message}`, true);
    return null;
  }
}

// Get all feedback (admin only)
async function getAllFeedback() {
  try {
    const response = await fetch(`${API_URL}/feedback`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'x-auth-token': authToken
      }
    });
    
    if (response.status === 403) {
      log('Access denied. Admin privileges required.', true);
      return null;
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get feedback');
    }
    
    const data = await response.json();
    log(`Retrieved ${data.feedback.length} feedback items`);
    return data.feedback;
  } catch (error) {
    log(`Error getting feedback: ${error.message}`, true);
    return null;
  }
}

// Update feedback status (admin only)
async function updateFeedbackStatus(id, status) {
  try {
    const response = await fetch(`${API_URL}/feedback/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'x-auth-token': authToken
      },
      body: JSON.stringify({ status })
    });
    
    if (response.status === 403) {
      log('Access denied. Admin privileges required.', true);
      return false;
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update feedback status');
    }
    
    log(`Feedback status updated to: ${status}`);
    return true;
  } catch (error) {
    log(`Error updating feedback status: ${error.message}`, true);
    return false;
  }
}

// Main test function
async function testFeedbackSystem() {
  console.log('Starting feedback system test...');
  
  // Step 1: Submit feedback as anonymous user
  console.log('\n--- Testing anonymous feedback submission ---');
  const anonymousFeedback = {
    type: 'feedback',
    title: 'Anonymous Feedback Test',
    description: 'This is a test feedback submitted anonymously.'
  };
  
  const anonymousResult = await submitFeedback(anonymousFeedback);
  if (!anonymousResult) {
    log('Anonymous feedback submission failed', true);
  }
  
  // Step 2: Login as regular user
  console.log('\n--- Testing authenticated user feedback submission ---');
  const loginSuccess = await login(testUser);
  if (!loginSuccess) {
    log('Test failed: Could not login as regular user', true);
    return;
  }
  
  // Step 3: Submit feedback as authenticated user
  const authenticatedFeedback = {
    type: 'bug',
    title: 'Authenticated Bug Report Test',
    description: 'This is a test bug report submitted by an authenticated user.'
  };
  
  const authenticatedResult = await submitFeedback(authenticatedFeedback);
  if (!authenticatedResult) {
    log('Authenticated feedback submission failed', true);
  }
  
  // Step 4: Try to access feedback as regular user (should fail)
  console.log('\n--- Testing feedback access as regular user ---');
  const regularUserFeedback = await getAllFeedback();
  if (regularUserFeedback) {
    log('Test failed: Regular user should not be able to access all feedback', true);
  } else {
    log('Regular user correctly denied access to feedback list');
  }
  
  // Step 5: Login as admin user
  console.log('\n--- Testing admin functionality ---');
  const adminLoginSuccess = await login(adminUser);
  if (!adminLoginSuccess) {
    log('Test failed: Could not login as admin user', true);
    return;
  }
  
  // Step 6: Access feedback as admin
  const adminFeedback = await getAllFeedback();
  if (!adminFeedback) {
    log('Test failed: Admin could not access feedback list', true);
    return;
  }
  
  // Step 7: Update feedback status as admin
  if (adminFeedback.length > 0) {
    const feedbackToUpdate = adminFeedback[0];
    console.log(`Updating feedback ID ${feedbackToUpdate.id} status to 'in-progress'`);
    
    const updateSuccess = await updateFeedbackStatus(feedbackToUpdate.id, 'in-progress');
    if (!updateSuccess) {
      log('Test failed: Admin could not update feedback status', true);
    }
  } else {
    log('No feedback found to update', true);
  }
  
  console.log('\nFeedback system test completed.');
}

// Run the test
testFeedbackSystem().catch(error => {
  console.error('Unhandled error:', error);
});