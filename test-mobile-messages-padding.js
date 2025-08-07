const puppeteer = require('puppeteer');

async function testMobileMessagesPadding() {
  console.log('Starting mobile messages padding test...');
  
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
    
    // Test 1: Check horizontal padding of conversation items
    console.log('Test 1: Checking conversation items padding...');
    const conversationItemPadding = await page.evaluate(() => {
      const item = document.querySelector('.conversationItem');
      if (!item) return null;
      const style = window.getComputedStyle(item);
      return {
        paddingLeft: style.paddingLeft,
        paddingRight: style.paddingRight
      };
    });
    
    console.log(`Conversation item padding: ${JSON.stringify(conversationItemPadding)}`);
    
    // Test 2: Check horizontal padding of message list
    console.log('Test 2: Checking message list padding...');
    
    // Select a conversation first (if available)
    const hasConversations = await page.evaluate(() => {
      return document.querySelectorAll('.conversationItem').length > 0;
    });
    
    if (hasConversations) {
      await page.click('.conversationItem');
      
      // Wait for message detail to load
      await page.waitForSelector('.messageList');
      
      const messageListPadding = await page.evaluate(() => {
        const messageList = document.querySelector('.messageList');
        if (!messageList) return null;
        const style = window.getComputedStyle(messageList);
        return {
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight
        };
      });
      
      console.log(`Message list padding: ${JSON.stringify(messageListPadding)}`);
      
      // Test 3: Check horizontal padding of message form
      console.log('Test 3: Checking message form padding...');
      const messageFormPadding = await page.evaluate(() => {
        const messageForm = document.querySelector('.messageForm');
        if (!messageForm) return null;
        const style = window.getComputedStyle(messageForm);
        return {
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight
        };
      });
      
      console.log(`Message form padding: ${JSON.stringify(messageFormPadding)}`);
      
      // Test 4: Check horizontal padding of header
      console.log('Test 4: Checking header padding...');
      const headerPadding = await page.evaluate(() => {
        const header = document.querySelector('.header');
        if (!header) return null;
        const style = window.getComputedStyle(header);
        return {
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight
        };
      });
      
      console.log(`Header padding: ${JSON.stringify(headerPadding)}`);
      
      // Test 5: Check if the content fits well on mobile
      console.log('Test 5: Checking if content fits well on mobile...');
      const horizontalOverflow = await page.evaluate(() => {
        // Check if there's any horizontal scrollbar
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (horizontalOverflow) {
        console.log('❌ Test 5 failed: Content causes horizontal scrolling');
      } else {
        console.log('✅ Test 5 passed: Content fits well without horizontal scrolling');
      }
    } else {
      console.log('⚠️ No conversations available to test message detail');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await browser.close();
    console.log('Test completed');
  }
}

testMobileMessagesPadding();