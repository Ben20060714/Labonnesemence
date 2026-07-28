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
      sendError(res, 'Fichier trop volumineux. La taille maximale est de 10 Mo.', 413);
      return;
    }
    sendError(res, `Erreur de téléversement : ${err.message}`, 400);
    return;
  }

  if (err.message.startsWith('File type not allowed')) {
    sendError(res, 'Type de fichier non autorisé.', 415);
    return;
  }

  sendError(res, 'Erreur interne du serveur.', 500);
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 'Route introuvable.', 404);
}
