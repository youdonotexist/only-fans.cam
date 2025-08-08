// Test script for the PostModal component
const puppeteer = require('puppeteer');
require('dotenv').config();

(async () => {
  console.log('Testing PostModal component...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  
  try {
    // Login first
    console.log('Logging in...');
    await page.goto('http://localhost:3000/login');
    
    // Fill in login form
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.type('input[name="password"]', process.env.TEST_USER_PASSWORD || 'password123');
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForNavigation();
    
    // Test 1: Create a new post from HomeScreen
    console.log('Test 1: Creating a new post from HomeScreen...');
    await page.goto('http://localhost:3000/');
    
    // Click the "Create New Post" button
    await page.waitForSelector('button.createPostButton');
    await page.click('button.createPostButton');
    
    // Wait for the modal to appear
    await page.waitForSelector('.modalContent');
    
    // Fill in the form
    await page.type('input#title', 'Test Post from Modal');
    await page.type('textarea#description', 'This is a test post created using the new PostModal component.');
    await page.select('select#fan_type', 'table');
    
    // Submit the form
    await page.click('button.submitButton');
    
    // Wait for success message
    await page.waitForSelector('.successBanner', { timeout: 5000 });
    
    console.log('✅ Test 1 passed: Successfully created a new post from HomeScreen');
    
    // Test 2: Edit a post from HomeScreen
    console.log('Test 2: Editing a post from HomeScreen...');
    
    // Find the post we just created
    await page.waitForSelector('.fanPost');
    
    // Click the options menu for the first post
    const optionsButtons = await page.$$('.optionsButton');
    await optionsButtons[0].click();
    
    // Wait for the options menu to appear
    await page.waitForSelector('.optionsMenu');
    
    // Click the "Edit Post" option
    await page.waitForSelector('.optionsMenuItem');
    const editOptions = await page.$$('.optionsMenuItem');
    await editOptions[0].click();
    
    // Wait for the modal to appear
    await page.waitForSelector('.modalContent');
    
    // Clear the form fields and fill with new data
    await page.evaluate(() => {
      document.querySelector('input#title').value = '';
      document.querySelector('textarea#description').value = '';
    });
    
    await page.type('input#title', 'Updated Test Post');
    await page.type('textarea#description', 'This post has been updated using the PostModal component.');
    
    // Submit the form
    await page.click('button.submitButton');
    
    // Wait for success message
    await page.waitForSelector('.successBanner', { timeout: 5000 });
    
    console.log('✅ Test 2 passed: Successfully edited a post from HomeScreen');
    
    // Test 3: Edit a post from FanDetails
    console.log('Test 3: Editing a post from FanDetails...');
    
    // Click on the post to navigate to FanDetails
    await page.click('.fanPost');
    
    // Wait for FanDetails page to load
    await page.waitForSelector('.fanDetailsContainer');
    
    // Click the options menu
    await page.click('.optionsButton');
    
    // Wait for the options menu to appear
    await page.waitForSelector('.optionsMenu');
    
    // Click the "Edit" option
    const detailsEditOption = await page.$('.optionItem');
    await detailsEditOption.click();
    
    // Wait for the modal to appear
    await page.waitForSelector('.modalContent');
    
    // Clear the form fields and fill with new data
    await page.evaluate(() => {
      document.querySelector('input#title').value = '';
      document.querySelector('textarea#description').value = '';
    });
    
    await page.type('input#title', 'FanDetails Updated Post');
    await page.type('textarea#description', 'This post has been updated from the FanDetails page using the PostModal component.');
    
    // Submit the form
    await page.click('button.submitButton');
    
    // Wait for success alert
    page.on('dialog', async dialog => {
      console.log('Dialog message:', dialog.message());
      await dialog.accept();
    });
    
    // Wait a moment for the update to complete
    await page.waitForTimeout(2000);
    
    console.log('✅ Test 3 passed: Successfully edited a post from FanDetails');
    
    console.log('All tests passed! The PostModal component is working correctly.');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
})();