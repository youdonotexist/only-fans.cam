/**
 * Test script to verify duplicate account prevention
 * 
 * This script tests registration with duplicate email and username
 */

const API_URL = 'https://only-fans-cam.onrender.com/api';

// Generate unique test data
const timestamp = Date.now();
const testUser = {
  username: `test_user_${timestamp}`,
  email: `test_${timestamp}@example.com`,
  password: 'password123',
  inviteCode: 'ONLYFANS2023'
};

// Test registration with original user
async function testOriginalRegistration() {
  console.log('\n--- Testing registration with original user ---');
  console.log(`Username: ${testUser.username}`);
  console.log(`Email: ${testUser.email}`);
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS: Original registration successful');
      console.log('Token received:', data.token ? 'Yes' : 'No');
      return true;
    } else {
      console.log('❌ FAILED: Original registration failed');
      console.log('Error:', data.message || JSON.stringify(data));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR: Exception during original registration');
    console.log(error);
    return false;
  }
}

// Test registration with duplicate email
async function testDuplicateEmail() {
  console.log('\n--- Testing registration with duplicate email ---');
  
  const duplicateEmailUser = {
    ...testUser,
    username: `different_user_${timestamp}`
  };
  
  console.log(`Username: ${duplicateEmailUser.username}`);
  console.log(`Email: ${testUser.email} (duplicate)`);
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(duplicateEmailUser)
    });
    
    const data = await response.json();
    
    if (!response.ok && data.message === 'User already exists') {
      console.log('✅ SUCCESS: Registration correctly rejected due to duplicate email');
      return true;
    } else if (response.ok) {
      console.log('❌ FAILED: Registration succeeded with duplicate email (should have failed)');
      return false;
    } else {
      console.log('❌ FAILED: Registration failed for a reason other than duplicate email');
      console.log('Error:', data.message || JSON.stringify(data));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR: Exception during duplicate email test');
    console.log(error);
    return false;
  }
}

// Test registration with duplicate username
async function testDuplicateUsername() {
  console.log('\n--- Testing registration with duplicate username ---');
  
  const duplicateUsernameUser = {
    ...testUser,
    email: `different_${timestamp}@example.com`
  };
  
  console.log(`Username: ${testUser.username} (duplicate)`);
  console.log(`Email: ${duplicateUsernameUser.email}`);
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(duplicateUsernameUser)
    });
    
    const data = await response.json();
    
    if (!response.ok && data.message === 'User already exists') {
      console.log('✅ SUCCESS: Registration correctly rejected due to duplicate username');
      return true;
    } else if (response.ok) {
      console.log('❌ FAILED: Registration succeeded with duplicate username (should have failed)');
      return false;
    } else {
      console.log('❌ FAILED: Registration failed for a reason other than duplicate username');
      console.log('Error:', data.message || JSON.stringify(data));
      return false;
    }
  } catch (error) {
    console.log('❌ ERROR: Exception during duplicate username test');
    console.log(error);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('=== DUPLICATE ACCOUNT PREVENTION TESTS ===');
  
  // First register an original user
  const originalSuccess = await testOriginalRegistration();
  
  if (originalSuccess) {
    // Then test duplicate email and username
    await testDuplicateEmail();
    await testDuplicateUsername();
  } else {
    console.log('\n❌ Cannot proceed with duplicate tests because original registration failed');
  }
  
  console.log('\n=== TESTS COMPLETED ===');
}

runTests();