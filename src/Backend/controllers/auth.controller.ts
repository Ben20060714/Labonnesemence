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
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !username || !password) {
    sendError(res, 'Email, username and password are required');
    return;
  }

  if (!isValidEmail(normalizedEmail)) {
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

  // Public registration always creates a standard user.
  // Administrative accounts must be created from the admin users route.
  const userRole = 'user';

  try {
    const existing = await db.maybeOne('SELECT id FROM users WHERE email = $1 OR username = $2', [normalizedEmail, username]);
    if (existing) {
      sendError(res, 'Email or username already in use', 409);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();

    await db.query(
      `
        INSERT INTO users (id, email, username, password, role)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [id, normalizedEmail, username, hashedPassword, userRole]
    );

    const user = await db.one<PublicUser>('SELECT id, email, username, role, image_url, created_at FROM users WHERE id = $1', [id]);

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await generateRefreshToken(user.id);

    sendSuccess(res, { user, accessToken, refreshToken }, 'Account created successfully', 201);
  } catch (error) {
    console.error('Register error:', error);
    sendError(res, 'Failed to create account', 500);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    sendError(res, 'Email and password are required');
    return;
  }

  try {
    const user = await db.maybeOne<User>('SELECT * FROM users WHERE email = $1', [normalizedEmail]);

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
    const refreshToken = await generateRefreshToken(user.id);

    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      image_url: user.image_url ?? null,
      created_at: user.created_at,
    };

    sendSuccess(res, { user: publicUser, accessToken, refreshToken }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Login failed', 500);
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    sendError(res, 'Refresh token required');
    return;
  }

  try {
    const { userId } = await verifyRefreshToken(refreshToken);

    const user = await db.maybeOne<User>('SELECT * FROM users WHERE id = $1', [userId]);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    await revokeRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken(user.id, user.email, user.role);
    const newRefreshToken = await generateRefreshToken(user.id);

    sendSuccess(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Tokens refreshed');
  } catch {
    sendError(res, 'Invalid or expired refresh token', 401);
  }
}

export async function heartbeat(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    sendError(res, 'Refresh token required');
    return;
  }

  try {
    const { userId } = await verifyRefreshToken(refreshToken);

    const user = await db.maybeOne<User>('SELECT * FROM users WHERE id = $1', [userId]);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    await revokeRefreshToken(refreshToken);

    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      image_url: user.image_url ?? null,
      created_at: user.created_at,
    };

    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const newRefreshToken = await generateRefreshToken(user.id);

    sendSuccess(
      res,
      {
        user: publicUser,
        accessToken,
        refreshToken: newRefreshToken,
      },
      'Session refreshed'
    );
  } catch {
    sendError(res, 'Invalid or expired refresh token', 401);
  }
}

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (refreshToken) {
    try {
      await revokeRefreshToken(refreshToken);
    } catch {
      // ignore errors on logout
    }
  }

  sendSuccess(res, null, 'Logged out successfully');
}

export async function logoutAll(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  await revokeAllUserRefreshTokens(req.user.userId);
  sendSuccess(res, null, 'Logged out from all devices');
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const user = await db.maybeOne<PublicUser>(
    'SELECT id, email, username, role, image_url, created_at FROM users WHERE id = $1',
    [req.user.userId]
  );

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
    const user = await db.maybeOne<User>('SELECT * FROM users WHERE id = $1', [req.user.userId]);
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
    await db.query('UPDATE users SET password = $1, updated_at = now() WHERE id = $2', [hashed, user.id]);

    await revokeAllUserRefreshTokens(user.id);

    sendSuccess(res, null, 'Password updated. Please log in again.');
  } catch (error) {
    console.error('Update password error:', error);
    sendError(res, 'Failed to update password', 500);
  }
}
