import { Request, Response } from 'express';
import db from '../models/database.ts';
import { sendSuccess, sendError } from '../utils/helpers.ts';

export const getAll = async (_req: Request, res: Response) => {
  try {
    const rows = await db.many('SELECT * FROM sermons ORDER BY created_at DESC');
    sendSuccess(res, rows, 'Enseignements recuperes');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const create = async (req: Request, res: Response) => {
  const { titre, verset, description, chemin, date, auteur, categorie, image_url } = req.body;
  try {
    const result = await db.one<{ id: number }>(
      `
        INSERT INTO sermons (titre, verset, description, chemin, image_url, date, auteur, categorie)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `,
      [titre, verset, description, chemin, image_url ?? null, date, auteur, categorie]
    );
    sendSuccess(res, { id: result.id }, 'Enseignement ajoute', 201);
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const update = async (req: Request, res: Response) => {
  const { titre, verset, description, chemin, date, auteur, categorie, image_url } = req.body;
  try {
    const result = await db.run(
      `
        UPDATE sermons
        SET titre = $1, verset = $2, description = $3, chemin = $4, image_url = $5,
            date = $6, auteur = $7, categorie = $8, updated_at = now()
        WHERE id = $9
      `,
      [titre, verset, description, chemin, image_url ?? null, date, auteur, categorie, req.params.id]
    );
    if (result.changes === 0) return sendError(res, 'Enseignement non trouve', 404);
    sendSuccess(res, null, 'Enseignement mis a jour');
  } catch (error: any) {
    sendError(res, error.message);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const result = await db.run('DELETE FROM sermons WHERE id = $1', [req.params.id]);
    if (result.changes === 0) return sendError(res, 'Enseignement non trouve', 404);
    sendSuccess(res, null, 'Enseignement supprime');
  } catch (error: any) {
    sendError(res, error.message);
  }
};
