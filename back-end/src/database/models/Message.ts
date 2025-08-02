/**
 * Message model representing the messages table in the database
 */
export class Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  is_read: boolean;
  created_at: string;

  // Additional fields that might be joined from other tables
  sender_username?: string;
  sender_profile_image?: string | null;
  recipient_username?: string;
  recipient_profile_image?: string | null;

  constructor(
    id: number,
    sender_id: number,
    recipient_id: number,
    content: string,
    is_read: boolean = false,
    created_at: string = new Date().toISOString(),
    sender_username?: string,
    sender_profile_image?: string | null,
    recipient_username?: string,
    recipient_profile_image?: string | null
  ) {
    this.id = id;
    this.sender_id = sender_id;
    this.recipient_id = recipient_id;
    this.content = content;
    this.is_read = is_read;
    this.created_at = created_at;
    this.sender_username = sender_username;
    this.sender_profile_image = sender_profile_image;
    this.recipient_username = recipient_username;
    this.recipient_profile_image = recipient_profile_image;
  }
}