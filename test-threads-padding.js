const puppeteer = require('puppeteer');

async function testThreadsPadding() {
  console.log('Starting threads padding test...');
  
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
    
    // Test: Check horizontal padding of conversation items
    console.log('Checking conversation items padding...');
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
    
    // Verify the padding is 10px
    if (conversationItemPadding && 
        conversationItemPadding.paddingLeft === '10px' && 
        conversationItemPadding.paddingRight === '10px') {
      console.log('✅ Test passed: Conversation item horizontal padding is exactly 10px');
    } else {
      console.log('❌ Test failed: Conversation item horizontal padding is not 10px');
      console.log(`  Left padding: ${conversationItemPadding?.paddingLeft}`);
      console.log(`  Right padding: ${conversationItemPadding?.paddingRight}`);
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await browser.close();
    console.log('Test completed');
  }
}

testThreadsPadding();