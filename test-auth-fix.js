const puppeteer = require('puppeteer');

async function testAuthenticationFix() {
  console.log('Starting authentication fix test...');
  
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
    
    // Click on login button
    console.log('Opening login modal...');
    const loginButton = await page.waitForSelector('button:has-text("Login")');
    await loginButton.click();
    await page.waitForTimeout(1000);
    
    // Fill in login form
    console.log('Filling login form...');
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="password"]', 'password123');
    
    // Submit login form
    console.log('Submitting login form...');
    const submitButton = await page.waitForSelector('button[type="submit"]:has-text("Login")');
    await submitButton.click();
    
    // Wait for login to complete
    console.log('Waiting for login to complete...');
    await page.waitForTimeout(2000);
    
    // Navigate to a protected route (profile page)
    console.log('Navigating to protected route...');
    await page.goto('http://localhost:3001/profile', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Check if login modal appears (it shouldn't if fix works)
    const loginModal = await page.$('.modalOverlay');
    if (loginModal) {
      console.error('❌ TEST FAILED: Login modal appeared on protected route after login');
    } else {
      console.log('✅ TEST PASSED: No login modal on protected route after login');
    }
    
    // Navigate to another protected route without refreshing
    console.log('Navigating to another protected route...');
    await page.goto('http://localhost:3001/new-post', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Check if login modal appears (it shouldn't if fix works)
    const loginModal2 = await page.$('.modalOverlay');
    if (loginModal2) {
      console.error('❌ TEST FAILED: Login modal appeared on second protected route');
    } else {
      console.log('✅ TEST PASSED: No login modal on second protected route');
    }
    
    console.log('Authentication fix test completed.');
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testAuthenticationFix();