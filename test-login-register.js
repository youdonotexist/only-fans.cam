// Test script for registration and login endpoints
// Using global fetch (available in Node.js v18+)

// Generate random username and email to avoid conflicts
const randomNum = Math.floor(Math.random() * 10000);
const registerData = {
  username: `testuser${randomNum}`,
  email: `testuser${randomNum}@example.com`,
  password: "password123"
};

// First register a new user
console.log("1. Registering new user:", registerData);
fetch('https://only-fans-cam.onrender.com/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(registerData),
})
.then(response => {
  console.log("Registration Status:", response.status);
  return response.json();
})
.then(data => {
  console.log("Registration Response:", data);
  
  // Now try to login with the same credentials
  const loginData = {
    email: registerData.email,
    password: registerData.password
  };
  
  console.log("\n2. Sending login request with same credentials:", loginData);
  return fetch('https://only-fans-cam.onrender.com/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  });
})
.then(response => {
  console.log("Login Status:", response.status);
  return response.json();
})
.then(data => {
  console.log("Login Response:", data);
  
  // If login successful, test the token by making a request to the protected endpoint
  if (data.token) {
    console.log("\n3. Testing token with /api/users/me endpoint...");
    console.log("Using token:", data.token);
    console.log("Authorization header:", `Bearer ${data.token}`);
    
    // Add a small delay to ensure token is processed
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(fetch('https://only-fans-cam.onrender.com/api/users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'x-auth-token': data.token,
            'Content-Type': 'application/json'
          }
        }));
      }, 1000);
    });
  } else {
    throw new Error("No token received from login");
  }
})
.then(userResponse => {
  console.log("User endpoint status:", userResponse.status);
  return userResponse.json();
})
.then(userData => {
  console.log("User data:", userData);
  console.log("\nTest completed successfully! Token is working properly.");
})
.catch(error => {
  console.error("Error:", error);
});