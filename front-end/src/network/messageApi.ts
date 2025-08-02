import { Message, Conversation, MessagesResponse, ConversationsResponse, UnreadCountResponse } from './models';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Get all conversations for the current user
 * @param token JWT token
 * @param page Page number
 * @param limit Items per page
 * @returns Promise with conversations and pagination data
 */
export const getConversations = async (
  token: string,
  page = 1,
  limit = 20
): Promise<ConversationsResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/messages/conversations?page=${page}&limit=${limit}`,
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
      throw new Error(errorData.message || 'Failed to fetch conversations');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get conversations error: ${error.message}`);
    }
    throw new Error('Failed to fetch conversations');
  }
};

/**
 * Get messages between current user and specified user
 * @param userId User ID of the other user
 * @param token JWT token
 * @param page Page number
 * @param limit Items per page
 * @returns Promise with messages and pagination data
 */
export const getMessages = async (
  userId: number,
  token: string,
  page = 1,
  limit = 50
): Promise<MessagesResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/messages/${userId}?page=${page}&limit=${limit}`,
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
      throw new Error(errorData.message || 'Failed to fetch messages');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get messages error: ${error.message}`);
    }
    throw new Error('Failed to fetch messages');
  }
};

/**
 * Send a message to a user
 * @param userId User ID of the recipient
 * @param content Message content
 * @param token JWT token
 * @returns Promise with the created message
 */
export const sendMessage = async (
  userId: number,
  content: string,
  token: string
): Promise<Message> => {
  try {
    const response = await fetch(`${API_URL}/messages/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send message');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Send message error: ${error.message}`);
    }
    throw new Error('Failed to send message');
  }
};

/**
 * Get count of unread messages
 * @param token JWT token
 * @returns Promise with unread count
 */
export const getUnreadMessageCount = async (
  token: string
): Promise<UnreadCountResponse> => {
  try {
    const response = await fetch(`${API_URL}/messages/unread/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get unread message count');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get unread count error: ${error.message}`);
    }
    throw new Error('Failed to get unread message count');
  }
};