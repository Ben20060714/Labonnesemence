import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import db from '../models/database';
import { v4 as uuidv4 } from 'uuid';
import { sendSuccess, sendError, parsePagination } from '../utils/helpers';
import { AuthRequest, FileRecord, FileWithUploader, PaginatedResponse, PaginationQuery } from '../types';
import { UPLOAD_PATH } from '../middlewares/upload.middleware';

export function uploadFile(req: AuthRequest, res: Response): void {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  if (!req.file) {
    sendError(res, 'No file uploaded');
    return;
  }

  const { is_public } = req.body as { is_public?: string };
  const isPublic = is_public === 'true' ? 1 : 0;

  try {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO files (id, filename, original_name, mimetype, size, uploader_id, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.file.filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      req.user.userId,
      isPublic
    );

    const file = db.prepare(`
      SELECT f.*, u.username as uploader_username
      FROM files f JOIN users u ON f.uploader_id = u.id
      WHERE f.id = ?
    `).get(id) as FileWithUploader;

    sendSuccess(res, file, 'File uploaded successfully', 201);
  } catch (error) {
    // Clean up uploaded file on DB error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    console.error('Upload error:', error);
    sendError(res, 'Failed to save file record', 500);
  }
}

export function uploadMultipleFiles(req: AuthRequest, res: Response): void {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    sendError(res, 'No files uploaded');
    return;
  }

  const { is_public } = req.body as { is_public?: string };
  const isPublic = is_public === 'true' ? 1 : 0;

  const insertMany = db.transaction((filesToInsert: Express.Multer.File[]) => {
    const results: string[] = [];
    for (const file of filesToInsert) {
      const id = uuidv4();
      db.prepare(`
        INSERT INTO files (id, filename, original_name, mimetype, size, uploader_id, is_public)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, file.filename, file.originalname, file.mimetype, file.size, req.user!.userId, isPublic);
      results.push(id);
    }
    return results;
  });

  try {
    const ids = insertMany(files);
    const uploadedFiles = ids.map(id =>
      db.prepare(`
        SELECT f.*, u.username as uploader_username
        FROM files f JOIN users u ON f.uploader_id = u.id
        WHERE f.id = ?
      `).get(id) as FileWithUploader
    );

    sendSuccess(res, uploadedFiles, `${files.length} files uploaded`, 201);
  } catch (error) {
    // Clean up all uploaded files on error
    files.forEach(file => fs.unlink(file.path, () => {}));
    console.error('Multi-upload error:', error);
    sendError(res, 'Failed to save file records', 500);
  }
}

export function downloadFile(req: AuthRequest, res: Response): void {
  const { id } = req.params;

  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(id) as FileRecord | undefined;
  if (!file) {
    sendError(res, 'File not found', 404);
    return;
  }

  // Private files: only uploader or admin
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

  const filePath = path.join(UPLOAD_PATH, file.filename);

  if (!fs.existsSync(filePath)) {
    sendError(res, 'File not found on disk', 404);
    return;
  }

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.original_name)}"`);
  res.setHeader('Content-Type', file.mimetype);
  res.setHeader('Content-Length', file.size);
  res.sendFile(filePath);
}

export function streamFile(req: AuthRequest, res: Response): void {
  const { id } = req.params;

  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(id) as FileRecord | undefined;
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

  const filePath = path.join(UPLOAD_PATH, file.filename);

  if (!fs.existsSync(filePath)) {
    sendError(res, 'File not found on disk', 404);
    return;
  }

  res.setHeader('Content-Type', file.mimetype);
  res.setHeader('Content-Length', file.size);
  res.sendFile(filePath);
}

export function getFiles(req: AuthRequest, res: Response): void {
  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const { page, limit, offset } = parsePagination(req.query as PaginationQuery);

  let where: string;
  const params: (string | number)[] = [];

  if (req.user.role === 'admin') {
    where = '';
  } else {
    where = 'WHERE f.uploader_id = ?';
    params.push(req.user.userId);
  }

  const total = (db.prepare(`SELECT COUNT(*) as count FROM files f ${where}`).get(...params) as { count: number }).count;

  const files = db.prepare(`
    SELECT f.*, u.username as uploader_username
    FROM files f JOIN users u ON f.uploader_id = u.id
    ${where}
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset) as FileWithUploader[];

  const response: PaginatedResponse<FileWithUploader> = {
    items: files,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  sendSuccess(res, response);
}

export function getFileInfo(req: AuthRequest, res: Response): void {
  const { id } = req.params;

  const file = db.prepare(`
    SELECT f.*, u.username as uploader_username
    FROM files f JOIN users u ON f.uploader_id = u.id
    WHERE f.id = ?
  `).get(id) as FileWithUploader | undefined;

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

export function deleteFile(req: AuthRequest, res: Response): void {
  const { id } = req.params;

  if (!req.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(id) as FileRecord | undefined;
  if (!file) {
    sendError(res, 'File not found', 404);
    return;
  }

  if (file.uploader_id !== req.user.userId && req.user.role !== 'admin') {
    sendError(res, 'Access denied', 403);
    return;
  }

  // Delete physical file
  const filePath = path.join(UPLOAD_PATH, file.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  db.prepare('DELETE FROM files WHERE id = ?').run(id);
  sendSuccess(res, null, 'File deleted');
}

export function updateFileVisibility(req: AuthRequest, res: Response): void {
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

  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(id) as FileRecord | undefined;
  if (!file) {
    sendError(res, 'File not found', 404);
    return;
  }

  if (file.uploader_id !== req.user.userId && req.user.role !== 'admin') {
    sendError(res, 'Access denied', 403);
    return;
  }

  db.prepare('UPDATE files SET is_public = ? WHERE id = ?').run(is_public ? 1 : 0, id);
  sendSuccess(res, null, `File is now ${is_public ? 'public' : 'private'}`);
}
