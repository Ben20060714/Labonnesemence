import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { JwtPayload, Role } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY = '30d';
const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

export function generateAccessToken(userId: string, email: string, role: Role): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const token = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString();

  await db.query(
    `
      INSERT INTO refresh_tokens (id, user_id, token, expires_at)
      VALUES ($1, $2, $3, $4)
    `,
    [uuidv4(), userId, token, expiresAt]
  );

  return token;
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string }> {
  const payload = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };

  const record = await db.maybeOne(
    `
      SELECT * FROM refresh_tokens
      WHERE token = $1 AND expires_at > now()
    `,
    [token]
  );

  if (!record) {
    throw new Error('Refresh token invalid or expired');
  }

  return payload;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await db.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}

export async function cleanExpiredRefreshTokens(): Promise<void> {
  await db.query('DELETE FROM refresh_tokens WHERE expires_at <= now()');
}
