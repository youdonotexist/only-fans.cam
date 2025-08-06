// For Node.js v18+
const { fetch } = require('undici');
// For older Node.js versions, uncomment the line below:
// const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:3000/api';
let authToken = null;

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
    
    log(`Logged in successfully as ${user.email}`);
    return true;
  } catch (error) {
    log(`Login error: ${error.message}`, true);
    return false;
  }
}

// Access admin feedback route
async function testAdminFeedbackAccess() {
  try {
    const response = await fetch(`${API_URL}/feedback`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'x-auth-token': authToken
      }
    });
    
    if (response.status === 403) {
      log('Access denied. Admin privileges required.', true);
      return false;
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to access admin feedback');
    }
    
    const data = await response.json();
    log(`Successfully accessed admin feedback route. Found ${data.feedback.length} feedback items.`);
    return true;
  } catch (error) {
    log(`Error accessing admin feedback: ${error.message}`, true);
    return false;
  }
}

// Main test function
async function testAdminFeedback() {
  console.log('Starting admin feedback access test...');
  
  // Step 1: Login as admin user
  const loginSuccess = await login(adminUser);
  if (!loginSuccess) {
    log('Test failed: Could not login as admin user', true);
    return;
  }
  
  // Step 2: Access admin feedback route
  const accessSuccess = await testAdminFeedbackAccess();
  if (!accessSuccess) {
    log('Test failed: Could not access admin feedback route', true);
    return;
  }
  
  console.log('\nAdmin feedback access test completed successfully!');
}

// Run the test
testAdminFeedback().catch(error => {
  console.error('Unhandled error:', error);
});