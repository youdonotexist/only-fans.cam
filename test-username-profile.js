const puppeteer = require('puppeteer');

async function testUsernameProfileAccess() {
  console.log('Starting username-based profile access test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1280,800']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the home page
    console.log('Navigating to home page...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Login to test authenticated views
    console.log('Logging in to test authenticated views...');
    const loginButton = await page.waitForSelector('button:has-text("Login")');
    await loginButton.click();
    await page.waitForTimeout(1000);
    
    // Fill in login form
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="password"]', 'password123');
    
    // Submit login form
    const submitButton = await page.waitForSelector('button[type="submit"]:has-text("Login")');
    await submitButton.click();
    
    // Wait for login to complete
    console.log('Waiting for login to complete...');
    await page.waitForTimeout(2000);
    
    // Test 1: Access a profile by username
    console.log('Test 1: Accessing a profile by username...');
    
    // Find a post with a username
    const usernameElement = await page.waitForSelector('.username');
    const username = await page.evaluate(el => el.textContent.trim(), usernameElement);
    
    console.log(`Found username: ${username}`);
    
    // Click on the username to navigate to the profile
    await usernameElement.click();
    await page.waitForTimeout(2000);
    
    // Check if the URL contains /user/
    const url = page.url();
    if (url.includes('/user/')) {
      console.log('✅ TEST PASSED: Successfully navigated to profile by username');
      console.log(`Current URL: ${url}`);
    } else {
      console.error('❌ TEST FAILED: Did not navigate to profile by username');
      console.log(`Current URL: ${url}`);
    }
    
    // Test 2: Directly access a profile by username
    console.log('Test 2: Directly accessing a profile by username...');
    
    // Navigate directly to the profile by username
    await page.goto(`http://localhost:3001/user/${username}`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Check if the profile loaded successfully
    const profileHeader = await page.$('.Profile_profileHeader__');
    if (profileHeader) {
      console.log('✅ TEST PASSED: Successfully loaded profile by direct username URL');
    } else {
      console.error('❌ TEST FAILED: Could not load profile by direct username URL');
    }
    
    console.log('Username-based profile access test completed.');
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testUsernameProfileAccess();