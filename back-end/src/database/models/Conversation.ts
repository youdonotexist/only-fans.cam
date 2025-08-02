/**
 * Conversation model representing the conversations table in the database
 */
export class Conversation {
  id: number;
  user1_id: number;
  user2_id: number;
  last_message_at: string;
  created_at: string;

  // Additional fields that might be joined from other tables
  user1_username?: string;
  user1_profile_image?: string | null;
  user2_username?: string;
  user2_profile_image?: string | null;
  last_message_content?: string;
  unread_count?: number;

  constructor(
    id: number,
    user1_id: number,
    user2_id: number,
    last_message_at: string = new Date().toISOString(),
    created_at: string = new Date().toISOString(),
    user1_username?: string,
    user1_profile_image?: string | null,
    user2_username?: string,
    user2_profile_image?: string | null,
    last_message_content?: string,
    unread_count?: number
  ) {
    this.id = id;
    this.user1_id = user1_id;
    this.user2_id = user2_id;
    this.last_message_at = last_message_at;
    this.created_at = created_at;
    this.user1_username = user1_username;
    this.user1_profile_image = user1_profile_image;
    this.user2_username = user2_username;
    this.user2_profile_image = user2_profile_image;
    this.last_message_content = last_message_content;
    this.unread_count = unread_count;
  }
}