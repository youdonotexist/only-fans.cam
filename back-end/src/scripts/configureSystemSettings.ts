import { Database } from 'sqlite3';
import { getDatabase } from '../database/init';
import { 
  getSystemSetting, 
  setSystemSetting,
  initializeVersionTracking
} from '../database/migrations';

/**
 * This script demonstrates how to use the system_settings table
 * for storing application configuration values.
 * 
 * It shows how to:
 * 1. Set configuration values
 * 2. Get configuration values
 * 3. Update configuration values
 */
async function configureSystemSettings() {
  console.log('Configuring system settings...');
  
  // Get database connection
  const db = getDatabase();
  
  try {
    // Ensure system_settings table exists
    await initializeVersionTracking(db);
    
    // Example configuration values
    const configValues = {
      'app.name': 'OnlyFans',
      'app.version': '1.0.0',
      'app.environment': process.env.NODE_ENV || 'development',
      'app.maintenance_mode': 'false',
      'app.max_upload_size': '5242880', // 5MB in bytes
      'email.from_address': 'noreply@onlyfans-example.com',
      'email.admin_address': 'admin@onlyfans-example.com',
      'limits.max_posts_per_day': '10',
      'limits.max_comments_per_hour': '20',
      'features.enable_notifications': 'true',
      'features.enable_messaging': 'true',
      'features.enable_image_upload': 'true'
    };
    
    // Set all configuration values
    console.log('Setting configuration values:');
    for (const [key, value] of Object.entries(configValues)) {
      await setSystemSetting(db, key, value);
      console.log(`  ${key} = ${value}`);
    }
    
    // Read all configuration values
    console.log('\nReading configuration values:');
    for (const key of Object.keys(configValues)) {
      const value = await getSystemSetting(db, key);
      console.log(`  ${key} = ${value}`);
    }
    
    // Update a configuration value
    console.log('\nUpdating configuration value:');
    const updatedValue = 'true';
    await setSystemSetting(db, 'app.maintenance_mode', updatedValue);
    console.log(`  app.maintenance_mode = ${updatedValue}`);
    
    // Verify the update
    const verifiedValue = await getSystemSetting(db, 'app.maintenance_mode');
    console.log(`  Verified: app.maintenance_mode = ${verifiedValue}`);
    
    // Example of how to use configuration values in application code
    console.log('\nExample usage in application code:');
    
    // Check if maintenance mode is enabled
    const maintenanceMode = await getSystemSetting(db, 'app.maintenance_mode');
    if (maintenanceMode === 'true') {
      console.log('  Application is in maintenance mode. Returning 503 Service Unavailable.');
    } else {
      console.log('  Application is running normally.');
    }
    
    // Check if a feature is enabled
    const enableMessaging = await getSystemSetting(db, 'features.enable_messaging');
    if (enableMessaging === 'true') {
      console.log('  Messaging feature is enabled.');
    } else {
      console.log('  Messaging feature is disabled.');
    }
    
    // Get a numeric limit
    const maxPostsPerDay = parseInt(await getSystemSetting(db, 'limits.max_posts_per_day') || '0', 10);
    console.log(`  Users can create up to ${maxPostsPerDay} posts per day.`);
    
    console.log('\nSystem settings configuration completed successfully.');
  } catch (error) {
    console.error('Error configuring system settings:', error);
  } finally {
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database connection:', err.message);
      }
      console.log('Database connection closed.');
    });
  }
}

// Run the configuration script
configureSystemSettings().catch(error => {
  console.error('Unhandled error during configuration:', error);
  process.exit(1);
});