import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Create S3 service object
const s3 = new AWS.S3();

// Bucket name from environment variables
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'only-fans-uploads';

// CloudFront domain from environment variables (optional)
// If set, S3 URLs will be replaced with CloudFront URLs
// Example: https://d24u7zy2lxe3ij.cloudfront.net
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

/**
 * Upload a file to S3
 * @param file File buffer to upload
 * @param fileType MIME type of the file
 * @param folder Folder path in the bucket
 * @returns URL of the uploaded file
 */
export const uploadFileToS3 = async (
  file: Buffer,
  fileType: string,
  folder: string = 'profile-images'
): Promise<string> => {
  // Generate a unique filename
  const fileName = `${folder}/${uuidv4()}-${Date.now()}`;
  
  // Set up the S3 upload parameters
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file,
    ContentType: fileType, CacheControl: 'public, max-age=31536000, immutable',
    ACL: 'public-read' // Make the file publicly accessible
  };
  
  try {
    // Log AWS configuration for debugging
    console.log('AWS Config:', {
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: BUCKET_NAME,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });
    
    // Upload the file to S3
    const data = await s3.upload(params).promise();
    
    console.log('S3 Upload successful:', data.Location);
    
    // If CloudFront domain is configured, replace S3 domain with CloudFront domain
    if (CLOUDFRONT_DOMAIN) {
      const s3Url = data.Location;
      const path = s3Url.split('/').slice(3).join('/');
      const cloudfrontUrl = `${CLOUDFRONT_DOMAIN}/${path}`;
      console.log('Using CloudFront URL:', cloudfrontUrl);
      return cloudfrontUrl;
    }
    
    // Return the original S3 URL if CloudFront is not configured
    return data.Location;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Delete a file from S3
 * @param fileUrl URL of the file to delete
 */
export const deleteFileFromS3 = async (fileUrl: string): Promise<void> => {
  // Extract the key from the file URL
  // Handle both S3 and CloudFront URLs
  let key: string;
  
  if (CLOUDFRONT_DOMAIN && fileUrl.includes(CLOUDFRONT_DOMAIN)) {
    // Handle CloudFront URL
    const urlWithoutProtocol = fileUrl.replace(/^https?:\/\//, '');
    const pathParts = urlWithoutProtocol.split('/');
    // Remove the domain part
    key = pathParts.slice(1).join('/');
  } else {
    // Handle S3 URL
    key = fileUrl.split('/').slice(3).join('/');
  }
  
  // Set up the S3 delete parameters
  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };
  
  try {
    // Delete the file from S3
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : String(error)}`);
  }
};