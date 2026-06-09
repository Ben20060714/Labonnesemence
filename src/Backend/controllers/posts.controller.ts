import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { sendSuccess, sendError, slugify, parsePagination } from '../utils/helpers';
import { AuthRequest, Post, PostWithAuthor, PaginatedResponse, PaginationQuery } from '../types';

export function getPosts(req: Request, res: Response): void {
  const { page, limit, offset } = parsePagination(req.query as PaginationQuery);
  const { author, search } = req.query as { author?: string; search?: string };

  let where = 'WHERE p.published = 1';
  const params: (string | number)[] = [];

  if (author) {
    where += ' AND u.username = ?';
    params.push(author);
  }

  if (search) {
    where += ' AND (p.title LIKE ? OR p.content LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const countQuery = `
    SELECT COUNT(*) as count
    FROM posts p
    JOIN users u ON p.author_id = u.id
    ${where}
  `;
  const total = (db.prepare(countQuery).get(...params) as { count: number }).count;

  const posts = db.prepare(`
    SELECT p.*, u.username as author_username, u.email as author_email
    FROM posts p
    JOIN users u ON p.author_id = u.id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as PostWithAuthor[];

  const response: PaginatedResponse<PostWithAuthor> = {
    items: posts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  sendSuccess(res, response);
}

export function getPostBySlug(req: Request, res: Response): void {
  const { slug } = req.params;

  const post = db.prepare(`
    SELECT p.*, u.username as author_username, u.email as author_email
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.slug = ? AND p.published = 1
  `).get(slug) as PostWithAuthor | undefined;

  if (!post) {
    sendError(res, 'Post not found', 404);
    return;
  }

  sendSuccess(res, post);
}

export function getAllPostsAdmin(req: AuthRequest, res: Response): void {
  const { page, limit, offset } = parsePagination(req.query as PaginationQuery);
  const { published } = req.query as { published?: string };

  let where = '';
  const params: (string | number)[] = [];

  // Admins see all posts; regular users see only their own
  if (req.user?.role !== 'admin') {
    where = 'WHERE p.author_id = ?';
    params.push(req.user!.userId);
  } else if (published !== undefined) {
    where = `WHERE p.published = ?`;
    params.push(published === 'true' ? 1 : 0);
  }

  const total = (db.prepare(`SELECT COUNT(*) as count FROM posts p ${where}`).get(...params) as { count: number }).count;

  const posts = db.prepare(`
    SELECT p.*, u.username as author_username, u.email as author_email
    FROM posts p
    JOIN users u ON p.author_id = u.id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as PostWithAuthor[];

  const response: PaginatedResponse<PostWithAuthor> = {
    items: posts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  sendSuccess(res, response);
}

export function createPost(req: AuthRequest, res: Response): void {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const { title, content, excerpt, published } = req.body as {
    title?: string;
    content?: string;
    excerpt?: string;
    published?: boolean;
  };

  if (!title || !content) {
    sendError(res, 'Title and content are required');
    return;
  }

  if (title.length < 3 || title.length > 200) {
    sendError(res, 'Title must be between 3 and 200 characters');
    return;
  }

  const id = uuidv4();
  let slug = slugify(title);

  // Ensure unique slug
  const existing = db.prepare('SELECT id FROM posts WHERE slug = ?').get(slug);
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  try {
    db.prepare(`
      INSERT INTO posts (id, title, slug, content, excerpt, author_id, published)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, slug, content, excerpt || null, req.user.userId, published ? 1 : 0);

    const post = db.prepare(`
      SELECT p.*, u.username as author_username, u.email as author_email
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `).get(id) as PostWithAuthor;

    sendSuccess(res, post, 'Post created', 201);
  } catch (error) {
    console.error('Create post error:', error);
    sendError(res, 'Failed to create post', 500);
  }
}

export function updatePost(req: AuthRequest, res: Response): void {
  const { id } = req.params;

  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as Post | undefined;
  if (!post) {
    sendError(res, 'Post not found', 404);
    return;
  }

  // Only the author or admin can update
  if (post.author_id !== req.user.userId && req.user.role !== 'admin') {
    sendError(res, 'Forbidden', 403);
    return;
  }

  const { title, content, excerpt, published } = req.body as {
    title?: string;
    content?: string;
    excerpt?: string;
    published?: boolean;
  };

  const newTitle = title || post.title;
  const newContent = content || post.content;
  const newExcerpt = excerpt !== undefined ? excerpt : post.excerpt;
  const newPublished = published !== undefined ? (published ? 1 : 0) : (post.published ? 1 : 0);

  let newSlug = post.slug;
  if (title && title !== post.title) {
    newSlug = slugify(title);
    const slugExists = db.prepare('SELECT id FROM posts WHERE slug = ? AND id != ?').get(newSlug, id);
    if (slugExists) {
      newSlug = `${newSlug}-${Date.now()}`;
    }
  }

  try {
    db.prepare(`
      UPDATE posts
      SET title = ?, slug = ?, content = ?, excerpt = ?, published = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(newTitle, newSlug, newContent, newExcerpt, newPublished, id);

    const updated = db.prepare(`
      SELECT p.*, u.username as author_username, u.email as author_email
      FROM posts p JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `).get(id) as PostWithAuthor;

    sendSuccess(res, updated, 'Post updated');
  } catch (error) {
    console.error('Update post error:', error);
    sendError(res, 'Failed to update post', 500);
  }
}

export function deletePost(req: AuthRequest, res: Response): void {
  const { id } = req.params;

  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as Post | undefined;
  if (!post) {
    sendError(res, 'Post not found', 404);
    return;
  }

  if (post.author_id !== req.user.userId && req.user.role !== 'admin') {
    sendError(res, 'Forbidden', 403);
    return;
  }

  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  sendSuccess(res, null, 'Post deleted');
}

export function publishPost(req: AuthRequest, res: Response): void {
  const { id } = req.params;

  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as Post | undefined;
  if (!post) {
    sendError(res, 'Post not found', 404);
    return;
  }

  if (post.author_id !== req.user.userId && req.user.role !== 'admin') {
    sendError(res, 'Forbidden', 403);
    return;
  }

  db.prepare("UPDATE posts SET published = 1, updated_at = datetime('now') WHERE id = ?").run(id);
  sendSuccess(res, null, 'Post published');
}

export function unpublishPost(req: AuthRequest, res: Response): void {
  const { id } = req.params;

  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as Post | undefined;
  if (!post) {
    sendError(res, 'Post not found', 404);
    return;
  }

  if (post.author_id !== req.user.userId && req.user.role !== 'admin') {
    sendError(res, 'Forbidden', 403);
    return;
  }

  db.prepare("UPDATE posts SET published = 0, updated_at = datetime('now') WHERE id = ?").run(id);
  sendSuccess(res, null, 'Post unpublished');
}
