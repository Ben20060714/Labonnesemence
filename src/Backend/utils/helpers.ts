import { Response } from 'express';
import { ApiResponse, PaginationQuery } from '../types';

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200): void {
  const response: ApiResponse<T> = { success: true, data };
  if (message) response.message = message;
  res.status(statusCode).json(response);
}

export function sendError(res: Response, error: string, statusCode = 400): void {
  const response: ApiResponse = { success: false, error };
  res.status(statusCode).json(response);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function parsePagination(query: PaginationQuery): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8;
}
