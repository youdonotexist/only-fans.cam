// Test script for registration endpoint
const fetch = require('node-fetch');

// Registration data
const userData = {
  username: "testuser" + Math.floor(Math.random() * 10000), // Random username to avoid conflicts
  email: `testuser${Math.floor(Math.random() * 10000)}@example.com`, // Random email to avoid conflicts
  password: "password123"
};

console.log("Sending registration request with data:", userData);

// Send POST request to registration endpoint
fetch('https://only-fans-cam.onrender.com/api/auth/register', {
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
})
.catch(error => {
  console.error("Error:", error);
});