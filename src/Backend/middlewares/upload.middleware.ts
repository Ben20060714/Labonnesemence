import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const ALLOWED_MIMETYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif', 'image/bmp',
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/x-aac',
  'video/mp4', 'video/webm', 'video/ogg',
  'application/pdf',
  'text/plain', 'text/csv',
  'application/json',
  'application/zip', 'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const getUploadCategory = (mimetype: string): string => {
  if (mimetype.startsWith('image/')) return 'images';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.startsWith('video/')) return 'videos';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.startsWith('text/') || mimetype === 'application/json') return 'documents';
  if (mimetype.includes('word') || mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'documents';
  if (mimetype.includes('zip')) return 'archives';
  return 'others';
};

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
});

export const getUploadCategoryForFile = getUploadCategory;
