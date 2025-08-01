// Test script for login endpoint
// Using global fetch (available in Node.js v18+)

// Login data
const userData = {
  email: "testuser@example.com", // Use an email that exists in your system
  password: "password123"
};

console.log("Sending login request with data:", userData);

// Send POST request to login endpoint
fetch('https://only-fans-cam.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(userData),
})
.then(response => {
  console.log("Status:", response.status);
  console.log("Status Text:", response.statusText);
  return response.json();
})
.then(data => {
  console.log("Response data:", data);
  
  // If login successful, test the token by making a request to the protected endpoint
  if (data.token) {
    console.log("\nTesting token with /api/users/me endpoint...");
    return fetch('https://only-fans-cam.onrender.com/api/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${data.token}`
      }
    })
    .then(userResponse => {
      console.log("User endpoint status:", userResponse.status);
      return userResponse.json();
    })
    .then(userData => {
      console.log("User data:", userData);
    });
  }
})
.catch(error => {
  console.error("Error:", error);
});