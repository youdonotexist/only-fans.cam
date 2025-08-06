const puppeteer = require('puppeteer');

async function testAvatarPlaceholders() {
  console.log('Starting avatar placeholder test...');
  
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
    
    // Check if sidebar is loaded
    console.log('Checking sidebar avatars...');
    const sidebarExists = await page.$('.Sidebar_sidebar__');
    if (sidebarExists) {
      console.log('✅ Sidebar loaded successfully');
    } else {
      console.log('❌ Sidebar not found');
    }
    
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
    
    // Navigate to profile page to check avatar
    console.log('Navigating to profile page...');
    await page.goto('http://localhost:3001/profile/me', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Check if profile avatar is loaded
    const profileAvatar = await page.$('.Profile_avatarImg__');
    if (profileAvatar) {
      console.log('✅ Profile avatar loaded successfully');
      
      // Check if it's using our Avatar component (no alt text visible)
      const altTextVisible = await page.evaluate(() => {
        const avatar = document.querySelector('.Profile_avatarImg__');
        // If the image fails to load and shows alt text, the computed height would be different
        return avatar.complete && avatar.naturalHeight !== 0;
      });
      
      if (altTextVisible) {
        console.log('✅ Profile avatar is displaying an image (not alt text)');
      } else {
        console.log('❌ Profile avatar might be showing alt text instead of placeholder');
      }
    } else {
      console.log('❌ Profile avatar not found');
    }
    
    // Navigate to messages page to check avatars in conversations
    console.log('Navigating to messages page...');
    await page.goto('http://localhost:3001/messages', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Check if message list avatars are loaded
    const messageAvatars = await page.$$('.MessageList_avatar__');
    if (messageAvatars.length > 0) {
      console.log(`✅ Found ${messageAvatars.length} message avatars`);
      
      // Check if they're using our Avatar component
      const allAvatarsLoaded = await page.evaluate(() => {
        const avatars = document.querySelectorAll('.MessageList_avatar__');
        return Array.from(avatars).every(avatar => avatar.complete && avatar.naturalHeight !== 0);
      });
      
      if (allAvatarsLoaded) {
        console.log('✅ All message avatars are displaying images (not alt text)');
      } else {
        console.log('❌ Some message avatars might be showing alt text instead of placeholder');
      }
    } else {
      console.log('ℹ️ No message avatars found (user might not have any conversations)');
      
      // Try to create a new message to test avatar in search results
      console.log('Testing new message modal...');
      const newMessageButton = await page.$('button:has-text("New Message")');
      if (newMessageButton) {
        await newMessageButton.click();
        await page.waitForTimeout(1000);
        
        // Search for a user
        await page.type('.NewMessageModal_searchInput__', 'test');
        await page.waitForTimeout(2000);
        
        // Check if search result avatars are loaded
        const searchAvatars = await page.$$('.NewMessageModal_userAvatar__');
        if (searchAvatars.length > 0) {
          console.log(`✅ Found ${searchAvatars.length} search result avatars`);
          
          // Check if they're using our Avatar component
          const allSearchAvatarsLoaded = await page.evaluate(() => {
            const avatars = document.querySelectorAll('.NewMessageModal_userAvatar__');
            return Array.from(avatars).every(avatar => avatar.complete && avatar.naturalHeight !== 0);
          });
          
          if (allSearchAvatarsLoaded) {
            console.log('✅ All search result avatars are displaying images (not alt text)');
          } else {
            console.log('❌ Some search result avatars might be showing alt text instead of placeholder');
          }
        } else {
          console.log('ℹ️ No search result avatars found');
        }
      } else {
        console.log('ℹ️ New message button not found');
      }
    }
    
    console.log('Avatar placeholder test completed.');
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

testAvatarPlaceholders();