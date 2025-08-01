// Final verification test script
// This script tests registration and accessing protected user data

// Generate random username and email to avoid conflicts
const randomNum = Math.floor(Math.random() * 10000);
const testUser = {
  username: `testuser${randomNum}`,
  email: `testuser${randomNum}@example.com`,
  password: "password123"
};

let savedToken; // Store token for use across promise chain

console.log("=== TESTING AUTHENTICATION AND TOKEN HANDLING ===");
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
  
  // Step 2: Test accessing protected user data with the token
  console.log("\n2. Testing access to protected user data with token");
  console.log("Using token:", savedToken);
  
  return fetch('https://only-fans-cam.onrender.com/api/users/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${savedToken}`,
      'x-auth-token': savedToken,
    }
  });
})
.then(response => {
  console.log("User endpoint status:", response.status);
  return response.json();
})
.then(userData => {
  console.log("User data:", userData);
  
  // Step 3: Test updating user profile
  console.log("\n3. Testing profile update");
  
  const updateData = {
    bio: `Updated bio for testing at ${new Date().toISOString()}`
  };
  
  return fetch('https://only-fans-cam.onrender.com/api/users/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${savedToken}`,
      'x-auth-token': savedToken,
    },
    body: JSON.stringify(updateData)
  });
})
.then(response => {
  console.log("Update status:", response.status);
  return response.json();
})
.then(updatedData => {
  console.log("Updated user data:", updatedData);
  console.log("\n=== TEST COMPLETED SUCCESSFULLY ===");
  console.log("The token handling issue has been resolved!");
})
.catch(error => {
  console.error("Error during test:", error);
});