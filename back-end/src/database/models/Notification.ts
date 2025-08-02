/**
 * Notification model representing the notifications table in the database
 */
export class Notification {
  id: number;
  user_id: number;
  fan_id: number;
  type: string;
  message: string;
  actor_id: number;
  is_read: boolean;
  created_at: string;

  // Additional fields that might be joined from other tables
  username?: string;
  actor_username?: string;
  actor_profile_image?: string | null;
  fan_title?: string;

  constructor(
    id: number,
    user_id: number,
    fan_id: number,
    type: string,
    message: string,
    actor_id: number,
    is_read: boolean = false,
    created_at: string = new Date().toISOString(),
    username?: string,
    actor_username?: string,
    actor_profile_image?: string | null,
    fan_title?: string
  ) {
    this.id = id;
    this.user_id = user_id;
    this.fan_id = fan_id;
    this.type = type;
    this.message = message;
    this.actor_id = actor_id;
    this.is_read = is_read;
    this.created_at = created_at;
    this.username = username;
    this.actor_username = actor_username;
    this.actor_profile_image = actor_profile_image;
    this.fan_title = fan_title;
  }
}