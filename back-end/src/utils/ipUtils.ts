import { Request } from 'express';

/**
 * Get the client IP address from the request object
 * Handles various headers that might contain the real IP address
 * when behind a proxy or load balancer
 * 
 * @param req Express request object
 * @returns Client IP address
 */
export function getClientIp(req: Request): string {
  // Check for X-Forwarded-For header (common when behind a proxy)
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    // X-Forwarded-For can be a comma-separated list of IPs
    // The leftmost IP is the original client IP
    const ips = Array.isArray(xForwardedFor) 
      ? xForwardedFor[0] 
      : xForwardedFor.split(',')[0].trim();
    return ips;
  }
  
  // Check for other common headers
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'] as string;
  }
  
  // Fall back to the remote address from the request
  // Note: req.connection is deprecated in newer Express versions
  return req.socket.remoteAddress || 
         (req.connection && req.connection.remoteAddress) || 
         'unknown';
}