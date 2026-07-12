import { Response } from 'express';
import path from 'path';
import db from '../models/database.ts';
import { v4 as uuidv4 } from 'uuid';
import { sendSuccess, sendError, parsePagination } from '../utils/helpers.ts';
import { AuthRequest, FileRecord, FileWithUploader, PaginatedResponse, PaginationQuery } from '../types';
import { getUploadCategoryForFile } from '../middlewares/upload.middleware.ts';
import { supabase, supabaseBucket } from '../utils/supabase.ts';

const getStoredFilename = (file: Express.Multer.File) => {
  const category = getUploadCategoryForFile(file.mimetype);
  const ext = path.extname(file.originalname).toLowerCase();
  return `${category}/${uuidv4()}${ext}`;
};

const uploadToBucket = async (file: Express.Multer.File, storedFilename: string) => {
  const { error } = await supabase.storage
    .from(supabaseBucket)
    .upload(storedFilename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;
};

const removeFromBucket = async (filename: string) => {
  const { error } = await supabase.storage.from(supabaseBucket).remove([filename]);
  if (error) throw error;
};

const sendBucketFile = async (res: Response, file: FileRecord, disposition: 'attachment' | 'inline') => {
  const { data, error } = await supabase.storage.from(supabaseBucket).download(file.filename);
  if (error || !data) {
    sendError(res, 'File not found in Supabase bucket', 404);
    return;
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(file.original_name)}"`);
  res.setHeader('Content-Type', file.mimetype);
  res.setHeader('Content-Length', buffer.length);
  res.send(buffer);
};

export async function uploadFile(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  if (!req.file) {
    sendError(res, 'No file uploaded');
    return;
  }

  const { is_public, legend, usage, categorie } = req.body as { is_public?: string; legend?: string; usage?: string; categorie?: string };
  const isPublic = is_public === 'true';
  const cleanedLegend = legend?.trim() || null;
  const cleanedUsage = usage?.trim() === 'cover' ? 'cover' : 'gallery';
  const cleanedCategorie = categorie?.trim() || null;
  const id = uuidv4();
  const storedFilename = getStoredFilename(req.file);

  try {
    await uploadToBucket(req.file, storedFilename);
    await db.query(
      `
        INSERT INTO files (id, filename, original_name, legend, usage, categorie, mimetype, size, uploader_id, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        id,
        storedFilename,
        req.file.originalname,
        cleanedLegend,
        cleanedUsage,
        cleanedCategorie,
        req.file.mimetype,
        req.file.size,
        req.user.userId,
        isPublic,
      ]
    );

    const file = await db.one<FileWithUploader>(
      `
        SELECT f.*, u.username as uploader_username
        FROM files f JOIN users u ON f.uploader_id = u.id
        WHERE f.id = $1
      `,
      [id]
    );

    sendSuccess(res, file, 'File uploaded successfully', 201);
  } catch (error) {
    await removeFromBucket(storedFilename).catch(() => {});
    console.error('Upload error:', error);
    sendError(res, 'Failed to upload file', 500);
  }
}

export async function uploadMultipleFiles(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    sendError(res, 'No files uploaded');
    return;
  }

  const { is_public, legend, usage, categorie } = req.body as { is_public?: string; legend?: string; usage?: string; categorie?: string };
  const isPublic = is_public === 'true';
  const cleanedLegend = legend?.trim() || null;
  const cleanedUsage = usage?.trim() === 'cover' ? 'cover' : 'gallery';
  const cleanedCategorie = categorie?.trim() || null;
  const uploadedPaths: string[] = [];

  try {
    const ids: string[] = [];

    for (const file of files) {
      const id = uuidv4();
      const storedFilename = getStoredFilename(file);
      await uploadToBucket(file, storedFilename);
      uploadedPaths.push(storedFilename);

      await db.query(
        `
          INSERT INTO files (id, filename, original_name, legend, usage, categorie, mimetype, size, uploader_id, is_public)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
        [id, storedFilename, file.originalname, cleanedLegend, cleanedUsage, cleanedCategorie, file.mimetype, file.size, req.user.userId, isPublic]
      );
      ids.push(id);
    }

    const uploadedFiles = await db.many<FileWithUploader>(
      `
        SELECT f.*, u.username as uploader_username
        FROM files f JOIN users u ON f.uploader_id = u.id
        WHERE f.id = ANY($1)
        ORDER BY f.created_at DESC
      `,
      [ids]
    );

    sendSuccess(res, uploadedFiles, `${files.length} files uploaded`, 201);
  } catch (error) {
    await Promise.all(uploadedPaths.map((filename) => removeFromBucket(filename).catch(() => {})));
    console.error('Multi-upload error:', error);
    sendError(res, 'Failed to upload files', 500);
  }
}

export async function downloadFile(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const file = await db.maybeOne<FileRecord>('SELECT * FROM files WHERE id = $1', [id]);
  if (!file) {
    sendError(res, 'File not found', 404);
    return;
  }

  if (!file.is_public) {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }
    if (file.uploader_id !== req.user.userId && req.user.role !== 'admin') {
      sendError(res, 'Access denied', 403);
      return;
    }
  }

  await sendBucketFile(res, file, 'attachment');
}

export async function streamFile(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const file = await db.maybeOne<FileRecord>('SELECT * FROM files WHERE id = $1', [id]);
  if (!file) {
    sendError(res, 'File not found', 404);
    return;
  }

  if (!file.is_public) {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }
    if (file.uploader_id !== req.user.userId && req.user.role !== 'admin') {
      sendError(res, 'Access denied', 403);
      return;
    }
  }

  await sendBucketFile(res, file, 'inline');
}

export async function getFiles(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const { page, limit, offset } = parsePagination(req.query as PaginationQuery);
  let where = '';
  const params: unknown[] = [];

  if (req.user.role !== 'admin') {
    where = 'WHERE f.uploader_id = $1';
    params.push(req.user.userId);
  }

  const total = Number((await db.one<{ count: string }>(`SELECT COUNT(*) as count FROM files f ${where}`, params)).count);
  const files = await db.many<FileWithUploader>(
    `
      SELECT f.*, u.username as uploader_username
      FROM files f JOIN users u ON f.uploader_id = u.id
      ${where}
      ORDER BY f.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `,
    [...params, limit, offset]
  );

  const response: PaginatedResponse<FileWithUploader> = {
    items: files,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  sendSuccess(res, response);
}

export async function getPublicFiles(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = parsePagination(req.query as PaginationQuery);
  const usage = typeof req.query.usage === 'string' ? req.query.usage.trim() : '';
  const filtrerUsage = usage === 'cover' || usage === 'gallery';

  const clauses = ['f.is_public = true'];
  const params: unknown[] = [];

  if (filtrerUsage) {
    clauses.push(`COALESCE(f.usage, 'gallery') = $${params.length + 1}`);
    params.push(usage);
  } else if (usage === 'all') {
    // no additional filter
  } else {
    clauses.push("COALESCE(f.usage, 'gallery') = 'gallery'");
  }

  const whereClause = `WHERE ${clauses.join(' AND ')}`;

  const total = Number((await db.one<{ count: string }>(`SELECT COUNT(*) as count FROM files f ${whereClause}`, params)).count);
  const files = await db.many<FileWithUploader>(
    `
      SELECT f.*, u.username as uploader_username
      FROM files f JOIN users u ON f.uploader_id = u.id
      ${whereClause}
      ORDER BY f.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `,
    [...params, limit, offset]
  );

  const response: PaginatedResponse<FileWithUploader> = {
    items: files,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  sendSuccess(res, response);
}

export async function getFileInfo(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const file = await db.maybeOne<FileWithUploader>(
    `
      SELECT f.*, u.username as uploader_username
      FROM files f JOIN users u ON f.uploader_id = u.id
      WHERE f.id = $1
    `,
    [id]
  );

  if (!file) {
    sendError(res, 'File not found', 404);
    return;
  }

  if (!file.is_public) {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }
    if (file.uploader_id !== req.user.userId && req.user.role !== 'admin') {
      sendError(res, 'Access denied', 403);
      return;
    }
  }

  sendSuccess(res, file);
}

export async function deleteFile(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const file = await db.maybeOne<FileRecord>('SELECT * FROM files WHERE id = $1', [id]);
  if (!file) {
    sendError(res, 'File not found', 404);
    return;
  }

  if (file.uploader_id !== req.user.userId && req.user.role !== 'admin') {
    sendError(res, 'Access denied', 403);
    return;
  }

  await removeFromBucket(file.filename);
  await db.query('DELETE FROM files WHERE id = $1', [id]);
  sendSuccess(res, null, 'File deleted');
}

export async function updateFileVisibility(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const { is_public } = req.body as { is_public?: boolean };

  if (is_public === undefined) {
    sendError(res, 'is_public field is required');
    return;
  }

  const file = await db.maybeOne<FileRecord>('SELECT * FROM files WHERE id = $1', [id]);
  if (!file) {
    sendError(res, 'File not found', 404);
    return;
  }

  if (file.uploader_id !== req.user.userId && req.user.role !== 'admin') {
    sendError(res, 'Access denied', 403);
    return;
  }

  await db.query('UPDATE files SET is_public = $1 WHERE id = $2', [!!is_public, id]);
  sendSuccess(res, null, `File is now ${is_public ? 'public' : 'private'}`);
}
