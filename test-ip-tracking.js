const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:3000/api';
let authToken = null;
let userId = null;

// Test user credentials
const testUser = {
  email: 'test@example.com',
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
async function login() {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
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

// Get login history
async function getLoginHistory() {
  try {
    const response = await fetch(`${API_URL}/auth/login-history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'x-auth-token': authToken,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get login history');
    }

    const data = await response.json();
    return data.loginHistory;
  } catch (error) {
    log(`Error getting login history: ${error.message}`, true);
    return null;
  }
}

// Main test function
async function testIpTracking() {
  console.log('Starting IP tracking test...');
  
  // Step 1: Login to create a login event
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('Test failed: Could not login', true);
    return;
  }
  
  // Step 2: Wait a moment for the login to be recorded
  console.log('Waiting for login to be recorded...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Step 3: Get login history
  const loginHistory = await getLoginHistory();
  if (!loginHistory) {
    log('Test failed: Could not retrieve login history', true);
    return;
  }
  
  // Step 4: Verify login history contains IP address
  if (loginHistory.length > 0) {
    const latestLogin = loginHistory[0];
    log(`Found ${loginHistory.length} login records`);
    log(`Latest login: ${JSON.stringify(latestLogin, null, 2)}`);
    
    if (latestLogin.ip_address) {
      log(`IP address tracking is working: ${latestLogin.ip_address}`);
    } else {
      log('IP address is missing from login record', true);
    }
    
    // Check login type
    if (latestLogin.login_type === 'login') {
      log('Login type is correctly recorded as "login"');
    } else {
      log(`Unexpected login type: ${latestLogin.login_type}`, true);
    }
    
    // Check user agent
    if (latestLogin.user_agent) {
      log(`User agent is recorded: ${latestLogin.user_agent}`);
    } else {
      log('User agent is missing from login record', true);
    }
  } else {
    log('No login history found', true);
  }
  
  console.log('IP tracking test completed.');
}

// Run the test
testIpTracking().catch(error => {
  console.error('Unhandled error:', error);
});