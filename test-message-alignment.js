// Simple script to test message alignment
const fs = require('fs');
const path = require('path');

// Read the MessageDetail.js file
const messageDetailPath = path.join(__dirname, 'front-end', 'src', 'components', 'MessageDetail.js');
const messageDetailContent = fs.readFileSync(messageDetailPath, 'utf8');

// Read the MessageDetail.module.css file
const cssPath = path.join(__dirname, 'front-end', 'src', 'components', 'MessageDetail.module.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Check if the message class assignment is correct
const messageClassAssignment = messageDetailContent.includes('message.sender_id === currentUserId ? styles.sent : styles.received');
console.log('Message class assignment is correct:', messageClassAssignment);

// Check if the sent class has the right CSS properties
const sentClassHasFlexEnd = cssContent.includes('.sent {') && 
                           cssContent.includes('align-self: flex-end');
console.log('Sent class has align-self: flex-end:', sentClassHasFlexEnd);

// Check if the sent class has margin-left: auto
const sentClassHasMarginLeft = cssContent.includes('.sent {') && 
                              cssContent.includes('margin-left: auto');
console.log('Sent class has margin-left: auto:', sentClassHasMarginLeft);

// Check if the received class has the right CSS properties
const receivedClassHasFlexStart = cssContent.includes('.received {') && 
                                 cssContent.includes('align-self: flex-start');
console.log('Received class has align-self: flex-start:', receivedClassHasFlexStart);

// Check if the received class has margin-right: auto
const receivedClassHasMarginRight = cssContent.includes('.received {') && 
                                   cssContent.includes('margin-right: auto');
console.log('Received class has margin-right: auto:', receivedClassHasMarginRight);

console.log('\nChecking for potential CSS conflicts or overrides...');

// Check if there are any other styles that might be overriding these
const otherFlexEndStyles = cssContent.match(/align-self:\s*flex-end/g) || [];
console.log('Number of align-self: flex-end occurrences:', otherFlexEndStyles.length);

const otherFlexStartStyles = cssContent.match(/align-self:\s*flex-start/g) || [];
console.log('Number of align-self: flex-start occurrences:', otherFlexStartStyles.length);

// Check if the message container has display: flex and flex-direction: column
const messageListHasFlexColumn = cssContent.includes('.messageList {') && 
                               cssContent.includes('display: flex') &&
                               cssContent.includes('flex-direction: column');
console.log('MessageList has display: flex and flex-direction: column:', messageListHasFlexColumn);