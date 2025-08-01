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
    ContentType: fileType,
    ACL: 'public-read' // Make the file publicly accessible
  };
  
  try {
    // Upload the file to S3
    const data = await s3.upload(params).promise();
    
    // Return the URL of the uploaded file
    return data.Location;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Delete a file from S3
 * @param fileUrl URL of the file to delete
 */
export const deleteFileFromS3 = async (fileUrl: string): Promise<void> => {
  // Extract the key from the file URL
  const key = fileUrl.split('/').slice(3).join('/');
  
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
    throw new Error('Failed to delete file from S3');
  }
};