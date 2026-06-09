import { getDb } from './database';
import { User, UserPublic, Role } from '../types';

export class UserModel {
  static findById(id: string): User | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  }

  static findByEmail(email: string): User | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
  }

  static findByUsername(username: string): User | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
  }

  static create(data: {
    id: string;
    email: string;
    password: string;
    username: string;
    role?: Role;
  }): User {
    const db = getDb();
    const role = data.role ?? 'user';
    db.prepare(`
      INSERT INTO users (id, email, password, username, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.id, data.email, data.password, data.username, role);

    return this.findById(data.id)!;
  }

  static findAll(page: number, limit: number): { users: UserPublic[]; total: number } {
    const db = getDb();
    const offset = (page - 1) * limit;
    const total = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
    const users = db.prepare(`
      SELECT id, email, username, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset) as UserPublic[];

    return { users, total };
  }

  static updateRole(id: string, role: Role): boolean {
    const db = getDb();
    const result = db.prepare(`
      UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?
    `).run(role, id);
    return result.changes > 0;
  }

  static delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static toPublic(user: User): UserPublic {
    const { password: _password, ...publicUser } = user;
    return publicUser;
  }
}
