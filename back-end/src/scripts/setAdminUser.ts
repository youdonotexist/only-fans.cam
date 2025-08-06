import { getDatabase } from '../database/init';

/**
 * Script to set admin role for a specific user by email
 * This is used to designate the admin user for the feedback system
 */

// Define the User interface
interface User {
  id: number;
  username: string;
}

const ADMIN_EMAIL = 'youdonotexist@gmail.com';

async function setAdminUser() {
  const db = getDatabase();
  
  console.log(`Setting admin role for user with email: ${ADMIN_EMAIL}`);
  
  // Check if user exists
  db.get('SELECT id, username FROM users WHERE email = ?', [ADMIN_EMAIL], (err, user: User | undefined) => {
    if (err) {
      console.error('Error checking for user:', err.message);
      db.close();
      return;
    }
    
    if (!user) {
      console.log(`User with email ${ADMIN_EMAIL} not found. Admin role will be set when user registers.`);
      db.close();
      return;
    }
    
    // Update user to set admin role
    db.run(
      'UPDATE users SET is_admin = 1, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
      [ADMIN_EMAIL],
      function(err) {
        if (err) {
          console.error('Error setting admin role:', err.message);
          db.close();
          return;
        }
        
        if (this.changes === 0) {
          console.log('No changes made. User might already be an admin.');
        } else {
          console.log(`Successfully set admin role for user: ${user.username} (ID: ${user.id})`);
        }
        
        db.close();
      }
    );
  });
}

// Run the script
setAdminUser().catch(err => {
  console.error('Unhandled error:', err);
});

// Export for potential use in other scripts
export { setAdminUser };