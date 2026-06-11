import { Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../models/database';
import { sendSuccess, sendError, parsePagination } from '../utils/helpers';
import { AuthRequest, User, PublicUser, PaginatedResponse, PaginationQuery } from '../types';

export function getAllUsers(req: AuthRequest, res: Response): void {
  const { page, limit, offset } = parsePagination(req.query as PaginationQuery);

  const total = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  const users = db.prepare(
    'SELECT id, email, username, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(limit, offset) as PublicUser[];

  const response: PaginatedResponse<PublicUser> = {
    items: users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  sendSuccess(res, response);
}

export function getPublicUsers(req: AuthRequest, res: Response): void {
  const { page, limit, offset } = parsePagination(req.query as PaginationQuery);

  const total = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  const users = db.prepare(
    'SELECT id, email, username, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(limit, offset) as PublicUser[];

  const response: PaginatedResponse<PublicUser> = {
    items: users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  sendSuccess(res, response);
}

export function getUserById(req: AuthRequest, res: Response): void {
  const { id } = req.params;

  const user = db.prepare(
    'SELECT id, email, username, role, created_at FROM users WHERE id = ?'
  ).get(id) as PublicUser | undefined;

  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }

  sendSuccess(res, user);
}

export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  // Non-admin users can only update their own profile
  if (req.user.role !== 'admin' && req.user.userId !== id) {
    sendError(res, 'Forbidden', 403);
    return;
  }

  const { username, email, role } = req.body as {
    username?: string;
    email?: string;
    role?: string;
  };

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }

  const newUsername = username || user.username;
  const newEmail = email ? email.toLowerCase() : user.email;
  // Only admins can change roles
  const newRole = (req.user.role === 'admin' && role) ? role : user.role;

  try {
    db.prepare(`
      UPDATE users SET username = ?, email = ?, role = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(newUsername, newEmail, newRole, id);

    const updated = db.prepare(
      'SELECT id, email, username, role, created_at FROM users WHERE id = ?'
    ).get(id) as PublicUser;

    sendSuccess(res, updated, 'User updated');
  } catch (error) {
    console.error('Update user error:', error);
    sendError(res, 'Failed to update user', 500);
  }
}

export function deleteUser(req: AuthRequest, res: Response): void {
  const { id } = req.params;

  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  // Non-admin users can only delete their own account
  if (req.user.role !== 'admin' && req.user.userId !== id) {
    sendError(res, 'Forbidden', 403);
    return;
  }

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  sendSuccess(res, null, 'User deleted');
}

export async function adminCreateUser(req: AuthRequest, res: Response): Promise<void> {
  const { email, username, password, role } = req.body as {
    email?: string;
    username?: string;
    password?: string;
    role?: string;
  };

  if (!email || !username || !password) {
    sendError(res, 'Email, username and password are required');
    return;
  }

  const userRole = role === 'admin' ? 'admin' : 'user';

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existing) {
      sendError(res, 'Email or username already in use', 409);
      return;
    }

    const { v4: uuidv4 } = await import('uuid');
    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();

    db.prepare(`
      INSERT INTO users (id, email, username, password, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, email.toLowerCase(), username, hashedPassword, userRole);

    const user = db.prepare(
      'SELECT id, email, username, role, created_at FROM users WHERE id = ?'
    ).get(id) as PublicUser;

    sendSuccess(res, user, 'User created by admin', 201);
  } catch (error) {
    console.error('Admin create user error:', error);
    sendError(res, 'Failed to create user', 500);
  }
}
