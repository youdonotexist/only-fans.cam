/**
 * User model representing the users table in the database
 */
export class User {
  id: number;
  username: string;
  email: string;
  password: string;
  bio: string | null;
  profile_image: string | null;
  created_at: string;
  updated_at: string;

  constructor(
    id: number,
    username: string,
    email: string,
    password: string,
    bio: string | null = null,
    profile_image: string | null = null,
    created_at: string = new Date().toISOString(),
    updated_at: string = new Date().toISOString()
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.bio = bio;
    this.profile_image = profile_image;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}