import { Notification, NotificationsResponse, UnreadCountResponse } from './models';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Get current user's notifications
 * @param token JWT token
 * @param page Page number
 * @param limit Items per page
 * @returns Promise with notifications and pagination data
 */
export const getNotifications = async (
  token: string,
  page = 1,
  limit = 20
): Promise<NotificationsResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/notifications?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch notifications');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get notifications error: ${error.message}`);
    }
    throw new Error('Failed to fetch notifications');
  }
};

/**
 * Mark a notification as read
 * @param id Notification ID
 * @param token JWT token
 * @returns Promise with success message
 */
export const markNotificationAsRead = async (
  id: number,
  token: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark notification as read');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Mark notification error: ${error.message}`);
    }
    throw new Error('Failed to mark notification as read');
  }
};

/**
 * Mark all notifications as read
 * @param token JWT token
 * @returns Promise with success message and count
 */
export const markAllNotificationsAsRead = async (
  token: string
): Promise<{ message: string; count: number }> => {
  try {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark all notifications as read');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Mark all notifications error: ${error.message}`);
    }
    throw new Error('Failed to mark all notifications as read');
  }
};

/**
 * Get count of unread notifications
 * @param token JWT token
 * @returns Promise with unread count
 */
export const getUnreadNotificationCount = async (
  token: string
): Promise<UnreadCountResponse> => {
  try {
    const response = await fetch(`${API_URL}/notifications/unread-count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get unread notification count');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get unread count error: ${error.message}`);
    }
    throw new Error('Failed to get unread notification count');
  }
};