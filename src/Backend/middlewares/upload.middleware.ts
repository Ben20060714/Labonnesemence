import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIMETYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm',
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const category = getUploadCategory(file.mimetype);
    const destination = path.join(UPLOAD_DIR, category);

    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export const UPLOAD_PATH = UPLOAD_DIR;
export const getUploadFilePath = (filename: string) => path.join(UPLOAD_DIR, filename);
