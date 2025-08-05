/**
 * Test script to verify the invite code functionality
 * 
 * This script tests registration with both valid and invalid invite codes
 */

const API_URL = 'https://only-fans-cam.onrender.com/api';

// Test user data with valid invite code
const testUserValid = {
  username: `test_user_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'password123',
  inviteCode: 'ONLYFANS2025' // This should match the default invite code
};

// Test user data with invalid invite code
const testUserInvalid = {
  username: `test_user_invalid_${Date.now()}`,
  email: `test_invalid_${Date.now()}@example.com`,
  password: 'password123',
  inviteCode: 'WRONGCODE'
};

// Test registration with valid invite code
async function testValidInviteCode() {
  console.log('\n--- Testing registration with valid invite code ---');
  console.log(`Username: ${testUserValid.username}`);
  console.log(`Email: ${testUserValid.email}`);
  console.log(`Invite Code: ${testUserValid.inviteCode}`);
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUserValid)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS: Registration successful with valid invite code');
      console.log('Token received:', data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ FAILED: Registration failed with valid invite code');
      console.log('Error:', data.message || JSON.stringify(data));
    }
  } catch (error) {
    console.log('❌ ERROR: Exception during registration with valid invite code');
    console.log(error);
  }
}

// Test registration with invalid invite code
async function testInvalidInviteCode() {
  console.log('\n--- Testing registration with invalid invite code ---');
  console.log(`Username: ${testUserInvalid.username}`);
  console.log(`Email: ${testUserInvalid.email}`);
  console.log(`Invite Code: ${testUserInvalid.inviteCode}`);
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUserInvalid)
    });
    
    const data = await response.json();
    
    if (!response.ok && data.message === 'Invalid invite code') {
      console.log('✅ SUCCESS: Registration correctly rejected with invalid invite code');
    } else if (response.ok) {
      console.log('❌ FAILED: Registration succeeded with invalid invite code (should have failed)');
    } else {
      console.log('❌ FAILED: Registration failed for a reason other than invalid invite code');
      console.log('Error:', data.message || JSON.stringify(data));
    }
  } catch (error) {
    console.log('❌ ERROR: Exception during registration with invalid invite code');
    console.log(error);
  }
}

// Run the tests
async function runTests() {
  console.log('=== INVITE CODE FUNCTIONALITY TESTS ===');
  
  // Test with invalid code first to avoid username/email conflicts
  await testInvalidInviteCode();
  
  // Then test with valid code
  await testValidInviteCode();
  
  console.log('\n=== TESTS COMPLETED ===');
}

runTests();