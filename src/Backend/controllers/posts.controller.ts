import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { sendSuccess, sendError, slugify, parsePagination } from '../utils/helpers';
import { AuthRequest, Post, PostWithAuthor, PaginatedResponse, PaginationQuery } from '../types';

export async function getPosts(req: Request, res: Response): Promise<void> {
  const { page, limit, offset } = parsePagination(req.query as PaginationQuery);
  const { author, search } = req.query as { author?: string; search?: string };

  let where = 'WHERE p.published = 1';
  const params: (string | number)[] = [];

  if (author) {
    where += ` AND u.username = $${params.length + 1}`;
    params.push(author);
  }

  if (search) {
    where += ` AND (p.title ILIKE $${params.length + 1} OR p.content ILIKE $${params.length + 2})`;
    params.push(`%${search}%`, `%${search}%`);
  }

  const countQuery = `
    SELECT COUNT(*) as count
    FROM posts p
    JOIN users u ON p.author_id = u.id
    ${where}
  `;
  const total = Number((await db.one<{ count: string }>(countQuery, params)).count);

  const posts = await db.many<PostWithAuthor>(`
    SELECT p.*, u.username as author_username, u.email as author_email
    FROM posts p
    JOIN users u ON p.author_id = u.id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `, [...params, limit, offset]);

  const response: PaginatedResponse<PostWithAuthor> = {
    items: posts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  sendSuccess(res, response);
}

export async function getPostBySlug(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;

  const post = await db.maybeOne<PostWithAuthor>(`
    SELECT p.*, u.username as author_username, u.email as author_email
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.slug = $1 AND p.published = true
  `, [slug]);

  if (!post) {
    sendError(res, 'Article introuvable.', 404);
    return;
  }

  sendSuccess(res, post);
}

export async function getAllPostsAdmin(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = parsePagination(req.query as PaginationQuery);
  const { published } = req.query as { published?: string };

  let where = '';
  const params: (string | number)[] = [];

  // Admins see all posts; regular users see only their own
  if (req.user?.role !== 'admin') {
    where = 'WHERE p.author_id = $1';
    params.push(req.user!.userId);
  } else if (published !== undefined) {
    where = `WHERE p.published = $1`;
    params.push(published === 'true' ? 1 : 0);
  }

  const total = Number((await db.one<{ count: string }>(`SELECT COUNT(*) as count FROM posts p ${where}`, params)).count);

  const posts = await db.many<PostWithAuthor>(`
    SELECT p.*, u.username as author_username, u.email as author_email
    FROM posts p
    JOIN users u ON p.author_id = u.id
    ${where}
    ORDER BY p.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `, [...params, limit, offset]);

  const response: PaginatedResponse<PostWithAuthor> = {
    items: posts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  sendSuccess(res, response);
}

export async function createPost(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'Non autorisé.', 401);
    return;
  }

  const { title, content, excerpt, published } = req.body as {
    title?: string;
    content?: string;
    excerpt?: string;
    published?: boolean;
  };

  if (!title || !content) {
    sendError(res, 'Le titre et le contenu sont requis.');
    return;
  }

  if (title.length < 3 || title.length > 200) {
    sendError(res, 'Le titre doit contenir entre 3 et 200 caractères.');
    return;
  }

  const id = uuidv4();
  let slug = slugify(title);

  // Ensure unique slug
  const existing = await db.maybeOne('SELECT id FROM posts WHERE slug = $1', [slug]);
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  try {
    await db.query(
      `
        INSERT INTO posts (id, title, slug, content, excerpt, author_id, published)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [id, title, slug, content, excerpt || null, req.user.userId, !!published]
    );

    const post = await db.one<PostWithAuthor>(`
      SELECT p.*, u.username as author_username, u.email as author_email
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `, [id]);

    sendSuccess(res, post, 'Article créé.', 201);
  } catch (error) {
    console.error('Create post error:', error);
    sendError(res, 'Impossible de créer l’article.', 500);
  }
}

export async function updatePost(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (!req.user) {
    sendError(res, 'Non autorisé.', 401);
    return;
  }

  const post = await db.maybeOne<Post>('SELECT * FROM posts WHERE id = $1', [id]);
  if (!post) {
    sendError(res, 'Article introuvable.', 404);
    return;
  }

  // Only the author or admin can update
  if (post.author_id !== req.user.userId && req.user.role !== 'admin') {
    sendError(res, 'Accès interdit.', 403);
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
  const newPublished = published !== undefined ? !!published : !!post.published;

  let newSlug = post.slug;
  if (title && title !== post.title) {
    newSlug = slugify(title);
    const slugExists = await db.maybeOne('SELECT id FROM posts WHERE slug = $1 AND id != $2', [newSlug, id]);
    if (slugExists) {
      newSlug = `${newSlug}-${Date.now()}`;
    }
  }

  try {
    await db.query(
      `
        UPDATE posts
        SET title = $1, slug = $2, content = $3, excerpt = $4, published = $5, updated_at = now()
        WHERE id = $6
      `,
      [newTitle, newSlug, newContent, newExcerpt, newPublished, id]
    );

    const updated = await db.one<PostWithAuthor>(`
      SELECT p.*, u.username as author_username, u.email as author_email
      FROM posts p JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `, [id]);

    sendSuccess(res, updated, 'Article mis à jour.');
  } catch (error) {
    console.error('Update post error:', error);
    sendError(res, 'Impossible de mettre à jour l’article.', 500);
  }
}

export async function deletePost(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (!req.user) {
    sendError(res, 'Non autorisé.', 401);
    return;
  }

  const post = await db.maybeOne<Post>('SELECT * FROM posts WHERE id = $1', [id]);
  if (!post) {
    sendError(res, 'Article introuvable.', 404);
    return;
  }

  if (post.author_id !== req.user.userId && req.user.role !== 'admin') {
    sendError(res, 'Accès interdit.', 403);
    return;
  }

  await db.query('DELETE FROM posts WHERE id = $1', [id]);
  sendSuccess(res, null, 'Article supprimé.');
}

export async function publishPost(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (!req.user) {
    sendError(res, 'Non autorisé.', 401);
    return;
  }

  const post = await db.maybeOne<Post>('SELECT * FROM posts WHERE id = $1', [id]);
  if (!post) {
    sendError(res, 'Article introuvable.', 404);
    return;
  }

  if (post.author_id !== req.user.userId && req.user.role !== 'admin') {
    sendError(res, 'Accès interdit.', 403);
    return;
  }

  await db.query('UPDATE posts SET published = true, updated_at = now() WHERE id = $1', [id]);
  sendSuccess(res, null, 'Article publié.');
}

export async function unpublishPost(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (!req.user) {
    sendError(res, 'Non autorisé.', 401);
    return;
  }

  const post = await db.maybeOne<Post>('SELECT * FROM posts WHERE id = $1', [id]);
  if (!post) {
    sendError(res, 'Article introuvable.', 404);
    return;
  }

  if (post.author_id !== req.user.userId && req.user.role !== 'admin') {
    sendError(res, 'Accès interdit.', 403);
    return;
  }

  await db.query('UPDATE posts SET published = false, updated_at = now() WHERE id = $1', [id]);
  sendSuccess(res, null, 'Article dépublié.');
}
