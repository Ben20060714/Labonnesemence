import { Request } from 'express';

export type Role = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  email: string;
  username: string;
  role: Role;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostWithAuthor extends Post {
  author_username: string;
  author_email: string;
}

export interface FileRecord {
  id: string;
  filename: string;
  original_name: string;
  mimetype: string;
  size: number;
  uploader_id: string;
  is_public: boolean;
  created_at: string;
}

export interface FileWithUploader extends FileRecord {
  uploader_username: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
