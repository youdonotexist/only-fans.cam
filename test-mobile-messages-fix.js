const puppeteer = require('puppeteer');

async function testMobileMessagesFixes() {
  console.log('Starting mobile messages fixes test...');
  
  // Launch browser with mobile viewport
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 375,
      height: 667,
      isMobile: true,
      hasTouch: true
    }
  });
  
  try {
    const page = await browser.newPage();
    
    // Set user agent to mobile
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');
    
    // Navigate to the app
    console.log('Navigating to the app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Login (adjust selectors and credentials as needed)
    console.log('Logging in...');
    await page.click('[data-testid="login-button"]');
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', 'testuser');
    await page.type('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Navigate to messages
    console.log('Navigating to messages...');
    await page.click('a[href="/messages"]');
    await page.waitForSelector('.messagesContainer');
    
    // Test 1: Check if the message detail panel takes full width
    console.log('Test 1: Checking message detail panel width...');
    const detailPanelWidth = await page.evaluate(() => {
      const panel = document.querySelector('.messageDetailPanel');
      return panel ? window.getComputedStyle(panel).width : null;
    });
    
    console.log(`Message detail panel width: ${detailPanelWidth}`);
    if (detailPanelWidth === '100%' || detailPanelWidth === `${await page.evaluate(() => window.innerWidth)}px`) {
      console.log('✅ Test 1 passed: Message detail panel takes full width');
    } else {
      console.log('❌ Test 1 failed: Message detail panel does not take full width');
    }
    
    // Test 2: Check if the back button is properly positioned (not overlapping)
    console.log('Test 2: Checking back button positioning...');
    
    // Select a conversation first (if available)
    const hasConversations = await page.evaluate(() => {
      return document.querySelectorAll('.conversationItem').length > 0;
    });
    
    if (hasConversations) {
      await page.click('.conversationItem');
      
      // Check if the toggle button is visible and not overlapped
      const toggleButtonVisible = await page.evaluate(() => {
        const button = document.querySelector('.toggleConversations');
        if (!button) return false;
        
        const buttonRect = button.getBoundingClientRect();
        const elementsAtPoint = document.elementsFromPoint(
          buttonRect.left + buttonRect.width / 2,
          buttonRect.top + buttonRect.height / 2
        );
        
        // The toggle button should be the first element at its position
        return elementsAtPoint[0] === button;
      });
      
      if (toggleButtonVisible) {
        console.log('✅ Test 2 passed: Back button is properly positioned and not overlapped');
      } else {
        console.log('❌ Test 2 failed: Back button may be overlapped or not visible');
      }
      
      // Test 3: Check if tapping on the back button shows the threads list
      console.log('Test 3: Testing back button functionality...');
      await page.click('.toggleConversations');
      
      const threadsVisible = await page.evaluate(() => {
        const panel = document.querySelector('.conversationsPanel');
        return panel && panel.classList.contains('visible');
      });
      
      if (threadsVisible) {
        console.log('✅ Test 3 passed: Back button shows threads list');
      } else {
        console.log('❌ Test 3 failed: Back button does not show threads list');
      }
      
      // Test 4: Check if tapping on a thread opens the thread
      console.log('Test 4: Testing thread selection...');
      
      // Click on a conversation item
      await page.click('.conversationItem');
      
      // Check if the conversation panel is hidden (meaning the thread is shown)
      const conversationPanelHidden = await page.evaluate(() => {
        const panel = document.querySelector('.conversationsPanel');
        return panel && !panel.classList.contains('visible');
      });
      
      if (conversationPanelHidden) {
        console.log('✅ Test 4 passed: Tapping on a thread opens the thread');
      } else {
        console.log('❌ Test 4 failed: Tapping on a thread does not open the thread');
      }
    } else {
      console.log('⚠️ No conversations available to test thread selection');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await browser.close();
    console.log('Test completed');
  }
}

testMobileMessagesFixes();