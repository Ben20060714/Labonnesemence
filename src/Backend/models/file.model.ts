import { getDb } from './database';
import { FileRecord } from '../types';

export class FileModel {
  static findById(id: string): FileRecord | undefined {
    const db = getDb();
    return db.prepare(`
      SELECT f.*, u.username as uploader_username
      FROM files f
      LEFT JOIN users u ON f.uploader_id = u.id
      WHERE f.id = ?
    `).get(id) as FileRecord | undefined;
  }

  static create(data: {
    id: string;
    original_name: string;
    stored_name: string;
    mime_type: string;
    size: number;
    uploader_id: string;
  }): FileRecord {
    const db = getDb();
    db.prepare(`
      INSERT INTO files (id, original_name, stored_name, mime_type, size, uploader_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      data.id,
      data.original_name,
      data.stored_name,
      data.mime_type,
      data.size,
      data.uploader_id
    );
    return this.findById(data.id)!;
  }

  static findAll(options: {
    page: number;
    limit: number;
    uploaderId?: string;
  }): { files: FileRecord[]; total: number } {
    const db = getDb();
    const { page, limit, uploaderId } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (uploaderId) {
      conditions.push('f.uploader_id = ?');
      params.push(uploaderId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const total = (db.prepare(`
      SELECT COUNT(*) as count FROM files f ${whereClause}
    `).get(...params) as { count: number }).count;

    const files = db.prepare(`
      SELECT f.*, u.username as uploader_username
      FROM files f
      LEFT JOIN users u ON f.uploader_id = u.id
      ${whereClause}
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as FileRecord[];

    return { files, total };
  }

  static delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM files WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
