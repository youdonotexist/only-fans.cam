/**
 * Follow model representing the follows table in the database
 */
export class Follow {
  follower_id: number;
  following_id: number;
  created_at: string;

  // Additional fields that might be joined from other tables
  follower_username?: string;
  follower_profile_image?: string | null;
  following_username?: string;
  following_profile_image?: string | null;

  constructor(
    follower_id: number,
    following_id: number,
    created_at: string = new Date().toISOString(),
    follower_username?: string,
    follower_profile_image?: string | null,
    following_username?: string,
    following_profile_image?: string | null
  ) {
    this.follower_id = follower_id;
    this.following_id = following_id;
    this.created_at = created_at;
    this.follower_username = follower_username;
    this.follower_profile_image = follower_profile_image;
    this.following_username = following_username;
    this.following_profile_image = following_profile_image;
  }
}