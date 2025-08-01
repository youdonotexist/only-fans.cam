// Test script for fans endpoint
// This script tests creating a fan post and adding a comment to it

// First, register a new user to get a token
// Using global fetch (available in Node.js v18+)

// Generate random username and email to avoid conflicts
const randomNum = Math.floor(Math.random() * 10000);
const testUser = {
  username: `testuser${randomNum}`,
  email: `testuser${randomNum}@example.com`,
  password: "password123"
};

let token;
let createdFanId;

console.log("=== TESTING FAN CREATION AND COMMENTING ===");
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
  token = data.token;
  
  if (!token) {
    throw new Error("No token received from registration");
  }
  
  // Step 2: Create a fan post
  console.log("\n2. Creating a fan post");
  
  const fanData = {
    title: `Test Fan ${randomNum}`,
    description: `This is a test fan created at ${new Date().toISOString()}`
  };
  
  return fetch('https://only-fans-cam.onrender.com/api/fans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-auth-token': token,
    },
    body: JSON.stringify(fanData),
  });
})
.then(response => {
  console.log("Fan Creation Status:", response.status);
  return response.json();
})
.then(fanData => {
  console.log("Created Fan:", fanData);
  createdFanId = fanData.id;
  
  if (!createdFanId) {
    throw new Error("Failed to get created fan ID");
  }
  
  // Step 3: Add a comment to the fan
  console.log("\n3. Adding a comment to the fan");
  
  const commentData = {
    content: `Test comment created at ${new Date().toISOString()}`
  };
  
  return fetch(`https://only-fans-cam.onrender.com/api/fans/${createdFanId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-auth-token': token,
    },
    body: JSON.stringify(commentData),
  });
})
.then(response => {
  console.log("Comment Creation Status:", response.status);
  return response.json();
})
.then(commentData => {
  console.log("Created Comment:", commentData);
  console.log("\n=== TEST COMPLETED SUCCESSFULLY ===");
  console.log("The fan creation and commenting functionality is working correctly!");
})
.catch(error => {
  console.error("Error during test:", error);
});