/**
 * Like model representing the likes table in the database
 */
export class Like {
  user_id: number;
  fan_id: number;
  created_at: string;

  // Additional fields that might be joined from other tables
  username?: string;
  user_profile_image?: string | null;
  fan_title?: string;

  constructor(
    user_id: number,
    fan_id: number,
    created_at: string = new Date().toISOString(),
    username?: string,
    user_profile_image?: string | null,
    fan_title?: string
  ) {
    this.user_id = user_id;
    this.fan_id = fan_id;
    this.created_at = created_at;
    this.username = username;
    this.user_profile_image = user_profile_image;
    this.fan_title = fan_title;
  }
}