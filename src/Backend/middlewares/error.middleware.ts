import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { sendError } from '../utils/helpers';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'File too large. Maximum size is 10MB', 413);
      return;
    }
    sendError(res, `Upload error: ${err.message}`, 400);
    return;
  }

  if (err.message.startsWith('File type not allowed')) {
    sendError(res, err.message, 415);
    return;
  }

  sendError(res, 'Internal server error', 500);
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 'Route not found', 404);
}
