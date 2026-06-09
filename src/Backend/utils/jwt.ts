import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { JwtPayload, Role } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export function generateAccessToken(userId: string, email: string, role: Role): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(userId: string): string {
  const token = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString();

  const stmt = db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(uuidv4(), userId, token, expiresAt);

  return token;
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  const payload = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };

  const record = db.prepare(`
    SELECT * FROM refresh_tokens
    WHERE token = ? AND expires_at > datetime('now')
  `).get(token);

  if (!record) {
    throw new Error('Refresh token invalid or expired');
  }

  return payload;
}

export function revokeRefreshToken(token: string): void {
  db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token);
}

export function revokeAllUserRefreshTokens(userId: string): void {
  db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(userId);
}

export function cleanExpiredRefreshTokens(): void {
  db.prepare("DELETE FROM refresh_tokens WHERE expires_at <= datetime('now')").run();
}
