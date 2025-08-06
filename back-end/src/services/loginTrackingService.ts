import { Request } from 'express';
import { getDatabase } from '../database/init';
import { getClientIp } from '../utils/ipUtils';

/**
 * Log a user login event to the database
 * 
 * @param userId User ID
 * @param req Express request object
 * @param loginType Type of login ('login' or 'register')
 * @returns Promise that resolves when the login is logged
 */
export async function logUserLogin(
  userId: number, 
  req: Request, 
  loginType: 'login' | 'register'
): Promise<void> {
  const db = getDatabase();
  const ipAddress = getClientIp(req);
  const userAgent = req.headers['user-agent'] || null;
  
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO user_logins (user_id, ip_address, login_type, user_agent) VALUES (?, ?, ?, ?)',
      [userId, ipAddress, loginType, userAgent],
      (err) => {
        if (err) {
          console.error('Error logging user login:', err.message);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

/**
 * Get login history for a user
 * 
 * @param userId User ID
 * @param limit Maximum number of records to return (default: 10)
 * @returns Promise that resolves with login history
 */
export async function getUserLoginHistory(
  userId: number,
  limit: number = 10
): Promise<any[]> {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM user_logins WHERE user_id = ? ORDER BY login_time DESC LIMIT ?',
      [userId, limit],
      (err, rows) => {
        if (err) {
          console.error('Error getting user login history:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}