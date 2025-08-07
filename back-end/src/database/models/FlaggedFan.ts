/**
 * FlaggedFan model representing the flagged_fans table in the database
 */
export class FlaggedFan {
  id: number;
  fan_id: number;
  reporter_id: number;
  reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  
  // Additional fields that might be joined from other tables
  fan_title?: string;
  reporter_username?: string;
  reporter_profile_image?: string | null;

  constructor(
    id: number,
    fan_id: number,
    reporter_id: number,
    reason: string,
    status: string = "pending",
    created_at: string = new Date().toISOString(),
    updated_at: string = new Date().toISOString(),
    fan_title?: string,
    reporter_username?: string,
    reporter_profile_image?: string | null
  ) {
    this.id = id;
    this.fan_id = fan_id;
    this.reporter_id = reporter_id;
    this.reason = reason;
    this.status = status;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.fan_title = fan_title;
    this.reporter_username = reporter_username;
    this.reporter_profile_image = reporter_profile_image;
  }
}