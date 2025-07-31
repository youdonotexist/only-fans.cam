/**
 * Fan model representing the fans table in the database
 */
export class Fan {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  
  // Additional fields that might be joined from other tables
  username?: string;
  user_profile_image?: string | null;

  constructor(
    id: number,
    user_id: number,
    title: string,
    description: string | null = null,
    created_at: string = new Date().toISOString(),
    updated_at: string = new Date().toISOString(),
    username?: string,
    user_profile_image?: string | null
  ) {
    this.id = id;
    this.user_id = user_id;
    this.title = title;
    this.description = description;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.username = username;
    this.user_profile_image = user_profile_image;
  }
}