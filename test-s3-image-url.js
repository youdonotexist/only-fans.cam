const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api';

// Function to get a fan by ID
async function getFanById(id) {
  try {
    console.log(`Getting fan with ID ${id}...`);
    const response = await axios.get(`${API_URL}/fans/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting fan:', error.response?.data || error.message);
    throw error;
  }
}

// Function to get all fans
async function getAllFans() {
  try {
    console.log('Getting all fans...');
    const response = await axios.get(`${API_URL}/fans`);
    return response.data;
  } catch (error) {
    console.error('Error getting fans:', error.response?.data || error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    // Get all fans
    const fansResponse = await getAllFans();
    const fans = fansResponse.fans || [];
    
    console.log(`Found ${fans.length} fans`);
    
    // Find fans with media
    const fansWithMedia = fans.filter(fan => fan.media_count > 0);
    console.log(`Found ${fansWithMedia.length} fans with media`);
    
    if (fansWithMedia.length === 0) {
      console.log('No fans with media found. Please create a fan with an image first.');
      return;
    }
    
    // Get details for each fan with media
    for (const fan of fansWithMedia) {
      const fanDetails = await getFanById(fan.id);
      
      console.log(`\nFan ID: ${fan.id}`);
      console.log(`Title: ${fan.title}`);
      console.log(`Media count: ${fan.media_count}`);
      
      if (fanDetails.media && fanDetails.media.length > 0) {
        console.log('Media:');
        fanDetails.media.forEach((media, index) => {
          console.log(`  ${index + 1}. ${media.file_path}`);
          
          // Check if it's an S3 URL
          if (media.file_path.includes('amazonaws.com')) {
            console.log('    ✅ This is an S3 URL');
          } else {
            console.log('    ❌ This is NOT an S3 URL');
          }
          
          // Try to fetch the image to verify it's accessible
          axios.get(media.file_path, { responseType: 'arraybuffer' })
            .then(() => {
              console.log('    ✅ Image is accessible');
            })
            .catch(error => {
              console.log(`    ❌ Image is not accessible: ${error.message}`);
            });
        });
      } else {
        console.log('No media found for this fan');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the main function
main();