import { getDb } from './database';
import { Post } from '../types';

export class PostModel {
  static findById(id: string): Post | undefined {
    const db = getDb();
    return db.prepare(`
      SELECT p.*, u.username as author_username
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `).get(id) as Post | undefined;
  }

  static findBySlug(slug: string): Post | undefined {
    const db = getDb();
    return db.prepare(`
      SELECT p.*, u.username as author_username
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.slug = ?
    `).get(slug) as Post | undefined;
  }

  static findAll(options: {
    page: number;
    limit: number;
    onlyPublished?: boolean;
    authorId?: string;
  }): { posts: Post[]; total: number } {
    const db = getDb();
    const { page, limit, onlyPublished = false, authorId } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: (string | number | boolean)[] = [];

    if (onlyPublished) {
      conditions.push('p.published = 1');
    }
    if (authorId) {
      conditions.push('p.author_id = ?');
      params.push(authorId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const total = (db.prepare(`
      SELECT COUNT(*) as count FROM posts p ${whereClause}
    `).get(...params) as { count: number }).count;

    const posts = db.prepare(`
      SELECT p.*, u.username as author_username
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as Post[];

    return { posts, total };
  }

  static create(data: {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    slug: string;
    published: boolean;
    author_id: string;
  }): Post {
    const db = getDb();
    db.prepare(`
      INSERT INTO posts (id, title, content, excerpt, slug, published, author_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.id,
      data.title,
      data.content,
      data.excerpt,
      data.slug,
      data.published ? 1 : 0,
      data.author_id
    );

    return this.findById(data.id)!;
  }

  static update(id: string, data: {
    title?: string;
    content?: string;
    excerpt?: string;
    slug?: string;
    published?: boolean;
  }): Post | undefined {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.content !== undefined) { fields.push('content = ?'); values.push(data.content); }
    if (data.excerpt !== undefined) { fields.push('excerpt = ?'); values.push(data.excerpt); }
    if (data.slug !== undefined) { fields.push('slug = ?'); values.push(data.slug); }
    if (data.published !== undefined) { fields.push('published = ?'); values.push(data.published ? 1 : 0); }

    if (fields.length === 0) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE posts SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  static delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static slugExists(slug: string, excludeId?: string): boolean {
    const db = getDb();
    if (excludeId) {
      const result = db.prepare('SELECT id FROM posts WHERE slug = ? AND id != ?').get(slug, excludeId);
      return result !== undefined;
    }
    const result = db.prepare('SELECT id FROM posts WHERE slug = ?').get(slug);
    return result !== undefined;
  }
}
