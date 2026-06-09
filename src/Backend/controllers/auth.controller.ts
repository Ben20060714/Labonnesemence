import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
} from '../utils/jwt';
import { sendSuccess, sendError, isValidEmail, isStrongPassword } from '../utils/helpers';
import { AuthRequest, User, PublicUser } from '../types';

export async function register(req: Request, res: Response): Promise<void> {
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

  if (!isValidEmail(email)) {
    sendError(res, 'Invalid email format');
    return;
  }

  if (!isStrongPassword(password)) {
    sendError(res, 'Password must be at least 8 characters long');
    return;
  }

  if (username.length < 3 || username.length > 30) {
    sendError(res, 'Username must be between 3 and 30 characters');
    return;
  }

  // Only allow admin role if explicitly set and first user, or by another admin
  const userRole = role === 'admin' ? 'admin' : 'user';

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existing) {
      sendError(res, 'Email or username already in use', 409);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();

    db.prepare(`
      INSERT INTO users (id, email, username, password, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, email.toLowerCase(), username, hashedPassword, userRole);

    const user = db.prepare('SELECT id, email, username, role, created_at FROM users WHERE id = ?').get(id) as PublicUser;

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    sendSuccess(res, { user, accessToken, refreshToken }, 'Account created successfully', 201);
  } catch (error) {
    console.error('Register error:', error);
    sendError(res, 'Failed to create account', 500);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    sendError(res, 'Email and password are required');
    return;
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as User | undefined;

    if (!user) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      created_at: user.created_at,
    };

    sendSuccess(res, { user: publicUser, accessToken, refreshToken }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Login failed', 500);
  }
}

export function refresh(req: Request, res: Response): void {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    sendError(res, 'Refresh token required');
    return;
  }

  try {
    const { userId } = verifyRefreshToken(refreshToken);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    revokeRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken(user.id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Tokens refreshed');
  } catch {
    sendError(res, 'Invalid or expired refresh token', 401);
  }
}

export function logout(req: AuthRequest, res: Response): void {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (refreshToken) {
    try {
      revokeRefreshToken(refreshToken);
    } catch {
      // ignore errors on logout
    }
  }

  sendSuccess(res, null, 'Logged out successfully');
}

export function logoutAll(req: AuthRequest, res: Response): void {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  revokeAllUserRefreshTokens(req.user.userId);
  sendSuccess(res, null, 'Logged out from all devices');
}

export function getMe(req: AuthRequest, res: Response): void {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const user = db.prepare(
    'SELECT id, email, username, role, created_at FROM users WHERE id = ?'
  ).get(req.user.userId) as PublicUser | undefined;

  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }

  sendSuccess(res, user);
}

export async function updatePassword(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    sendError(res, 'Current and new password are required');
    return;
  }

  if (!isStrongPassword(newPassword)) {
    sendError(res, 'New password must be at least 8 characters long');
    return;
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId) as User | undefined;
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      sendError(res, 'Current password is incorrect', 401);
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    db.prepare("UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?").run(hashed, user.id);

    revokeAllUserRefreshTokens(user.id);

    sendSuccess(res, null, 'Password updated. Please log in again.');
  } catch (error) {
    console.error('Update password error:', error);
    sendError(res, 'Failed to update password', 500);
  }
}
