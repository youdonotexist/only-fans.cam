/**
 * Media model representing the media table in the database
 */
export class Media {
  id: number;
  fan_id: number;
  file_path: string;
  file_type: string;
  created_at: string;

  constructor(
    id: number,
    fan_id: number,
    file_path: string,
    file_type: string,
    created_at: string = new Date().toISOString()
  ) {
    this.id = id;
    this.fan_id = fan_id;
    this.file_path = file_path;
    this.file_type = file_type;
    this.created_at = created_at;
  }
}