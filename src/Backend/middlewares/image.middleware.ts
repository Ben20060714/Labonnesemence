import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/helpers.ts';
import path from 'path';

/**
 * Traite un seul buffer d'image pour le convertir en WebP optimisé
 */
const processImageBuffer = async (file: Express.Multer.File) => {
  if (!file.mimetype.startsWith('image/') || file.mimetype === 'image/svg+xml') {
    return file;
  }

  const originalName = path.parse(file.originalname).name;
  const timestamp = Date.now();
  const newFilename = `${timestamp}-${originalName}.webp`;

  const optimizedBuffer = await sharp(file.buffer)
    .withMetadata()
    .webp({ quality: 80 })
    .toBuffer();

  return {
    ...file,
    buffer: optimizedBuffer,
    mimetype: 'image/webp',
    originalname: newFilename,
    size: optimizedBuffer.length,
  };
};

/**
 * Middleware d'optimisation d'image
 * Convertit les images uploadées en WebP, conserve les métadonnées et compresse à 80% de qualité.
 * Traitement entièrement en mémoire (Buffer) pour une performance maximale.
 */
export const optimizeImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Gestion du fichier unique
    if (req.file) {
      req.file = await processImageBuffer(req.file) as any;
    }

    // Gestion des fichiers multiples
    if (req.files && Array.isArray(req.files)) {
      const files = req.files as Express.Multer.File[];
      const processedFiles = await Promise.all(files.map(file => processImageBuffer(file)));
      req.files = processedFiles as any;
    }

    next();
  } catch (error) {
    console.error('Erreur optimisation Sharp:', error);
    sendError(res, "Erreur lors du traitement des images", 500);
  }
};
