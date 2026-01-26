// Type definitions for the application

export interface Env {
  DB: D1Database;
  API_KEY: string;
}

// Material Pool (素材池)
export interface Material {
  id: string;
  title: string;
  body: string;
  source?: string;
  tags?: string;
  collection_time: number;
  status: string;
  created_at: number;
  updated_at: number;
}

export interface CreateMaterialInput {
  title: string;
  body: string;
  source?: string;
  tags?: string;
  collection_time?: number;
  status?: string;
}

export interface UpdateMaterialInput {
  title?: string;
  body?: string;
  source?: string;
  tags?: string;
  status?: string;
}

export interface MaterialFilters {
  status?: string;
  start_time?: number;
  end_time?: number;
  limit?: number;
  offset?: number;
}

// To-Publish Pool (待发池)
export interface ToPublish {
  id: string;
  final_title: string;
  final_body: string;
  platform: string;
  review_status: string;
  material_id?: string;
  created_at: number;
  updated_at: number;
}

export interface CreateToPublishInput {
  final_title: string;
  final_body: string;
  platform: string;
  review_status?: string;
  material_id?: string;
}

export interface UpdateToPublishInput {
  final_title?: string;
  final_body?: string;
  platform?: string;
  review_status?: string;
}

export interface ToPublishFilters {
  review_status?: string;
  platform?: string;
  limit?: number;
  offset?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
