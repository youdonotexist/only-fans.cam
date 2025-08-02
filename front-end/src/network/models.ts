// TypeScript models for API requests and responses

// Auth Models
export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  profile_image?: string;
  created_at: string;
  updated_at?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
}

// Fan Models
export interface Fan {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  username?: string;
  user_profile_image?: string;
  media_count?: number;
  likes_count?: number;
}

export interface FanWithDetails extends Fan {
  media: Media[];
  comments: Comment[];
}

export interface CreateFanRequest {
  title: string;
  description?: string;
}

export interface UpdateFanRequest {
  title?: string;
  description?: string;
}

export interface FansResponse {
  fans: Fan[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

// Media Models
export interface Media {
  id: number;
  fan_id: number;
  file_path: string;
  file_type: 'image' | 'video';
  created_at?: string;
  updated_at?: string;
}

export interface UploadMediaResponse {
  message: string;
  media: Media[];
}

// Comment Models
export interface Comment {
  id: number;
  user_id: number;
  fan_id: number;
  content: string;
  created_at: string;
  updated_at?: string;
  username?: string;
  user_profile_image?: string;
}

export interface CreateCommentRequest {
  content: string;
}

// Follow Models
export interface Follow {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
}

export interface FollowerUser {
  id: number;
  username: string;
  bio?: string;
  profile_image?: string;
  followed_at: string;
}

export interface FollowersResponse {
  followers: FollowerUser[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface FollowingResponse {
  following: FollowerUser[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

// Like Models
export interface Like {
  id: number;
  user_id: number;
  fan_id: number;
  created_at: string;
}

// Notification Models
export interface Notification {
  id: number;
  user_id: number;
  fan_id: number;
  type: 'comment' | 'like' | 'follow';
  message: string;
  actor_id: number;
  is_read: boolean;
  created_at: string;
  actor_username?: string;
  actor_profile_image?: string;
  fan_title?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}