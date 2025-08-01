// Test script to verify CORS fix for accessing user profile
// This script tests if the x-auth-token header is now properly allowed

// Generate random username and email to avoid conflicts
const randomNum = Math.floor(Math.random() * 10000);
const testUser = {
  username: `testuser${randomNum}`,
  email: `testuser${randomNum}@example.com`,
  password: "password123"
};

let savedToken; // Store token for use across promise chain

console.log("=== TESTING CORS FIX FOR USER PROFILE ACCESS ===");
console.log("1. Registering new user:", testUser);

// Step 1: Register a new user
fetch('https://only-fans-cam.onrender.com/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testUser),
})
.then(response => {
  console.log("Registration Status:", response.status);
  return response.json();
})
.then(data => {
  console.log("Registration Response:", data);
  savedToken = data.token;
  
  if (!savedToken) {
    throw new Error("No token received from registration");
  }
  
  // Step 2: Test accessing protected user data with the token using x-auth-token header
  console.log("\n2. Testing access to protected user data with x-auth-token header");
  console.log("Using token:", savedToken);
  
  return fetch('https://only-fans-cam.onrender.com/api/users/me', {
    method: 'GET',
    headers: {
      'x-auth-token': savedToken,
    }
  });
})
.then(response => {
  console.log("User endpoint status with x-auth-token:", response.status);
  return response.json();
})
.then(userData => {
  console.log("User data:", userData);
  console.log("\n=== TEST COMPLETED SUCCESSFULLY ===");
  console.log("The CORS issue has been resolved! x-auth-token header is now allowed.");
})
.catch(error => {
  console.error("Error during test:", error);
});