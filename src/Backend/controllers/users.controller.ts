import { Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../models/database';
import { sendSuccess, sendError, parsePagination } from '../utils/helpers';
import { AuthRequest, User, PublicUser, PaginatedResponse, PaginationQuery } from '../types';

export async function getAllUsers(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = parsePagination(req.query as PaginationQuery);

  const total = Number((await db.one<{ count: string }>('SELECT COUNT(*) as count FROM users')).count);
  const users = await db.many<PublicUser>(
    'SELECT id, email, username, role, image_url, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  const response: PaginatedResponse<PublicUser> = {
    items: users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  sendSuccess(res, response);
}

export async function getPublicUsers(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = parsePagination(req.query as PaginationQuery);

  const total = Number((await db.one<{ count: string }>('SELECT COUNT(*) as count FROM users')).count);
  const users = await db.many<PublicUser>(
    'SELECT id, email, username, role, image_url, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  const response: PaginatedResponse<PublicUser> = {
    items: users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  sendSuccess(res, response);
}

export async function getUserById(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  if (req.user.role !== 'admin' && req.user.userId !== id) {
    sendError(res, 'Forbidden', 403);
    return;
  }

  const user = await db.maybeOne<PublicUser>(
    'SELECT id, email, username, role, image_url, created_at FROM users WHERE id = $1',
    [id]
  );

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

  const { username, email, role, image_url } = req.body as {
    username?: string;
    email?: string;
    role?: string;
    image_url?: string | null;
  };
  const normalizedEmail = email?.trim().toLowerCase();

  const user = await db.maybeOne<User>('SELECT * FROM users WHERE id = $1', [id]);
  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }

  const newUsername = username?.trim() || user.username;
  const newEmail = normalizedEmail || user.email;
  // Only admins can change roles
  const newRole = (req.user.role === 'admin' && role) ? role : user.role;

  const existingConflict = await db.maybeOne<{ id: string }>(
    'SELECT id FROM users WHERE (email = $1 OR username = $2) AND id != $3',
    [newEmail, newUsername, id]
  );

  if (existingConflict) {
    sendError(res, 'Email or username already in use', 409);
    return;
  }

  try {
    await db.query(
      `
        UPDATE users SET username = $1, email = $2, role = $3, image_url = $4, updated_at = now()
        WHERE id = $5
      `,
      [newUsername, newEmail, newRole, image_url ?? user.image_url ?? null, id]
    );

    const updated = await db.one<PublicUser>(
      'SELECT id, email, username, role, image_url, created_at FROM users WHERE id = $1',
      [id]
    );

    sendSuccess(res, updated, 'User updated');
  } catch (error) {
    console.error('Update user error:', error);
    sendError(res, 'Failed to update user', 500);
  }
}

export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
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

  const user = await db.maybeOne('SELECT id FROM users WHERE id = $1', [id]);
  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }

  await db.query('DELETE FROM users WHERE id = $1', [id]);
  sendSuccess(res, null, 'User deleted');
}

export async function adminCreateUser(req: AuthRequest, res: Response): Promise<void> {
  const { email, username, password, role, image_url } = req.body as {
    email?: string;
    username?: string;
    password?: string;
    role?: string;
    image_url?: string | null;
  };
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !username || !password) {
    sendError(res, 'Email, username and password are required');
    return;
  }

  const userRole = role === 'admin' ? 'admin' : 'user';

  try {
    const existing = await db.maybeOne('SELECT id FROM users WHERE email = $1 OR username = $2', [normalizedEmail, username]);
    if (existing) {
      sendError(res, 'Email or username already in use', 409);
      return;
    }

    const { v4: uuidv4 } = await import('uuid');
    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();

    await db.query(
      `
        INSERT INTO users (id, email, username, password, role, image_url)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [id, normalizedEmail, username, hashedPassword, userRole, image_url ?? null]
    );

    const user = await db.one<PublicUser>(
      'SELECT id, email, username, role, image_url, created_at FROM users WHERE id = $1',
      [id]
    );

    sendSuccess(res, user, 'User created by admin', 201);
  } catch (error) {
    console.error('Admin create user error:', error);
    sendError(res, 'Failed to create user', 500);
  }
}
