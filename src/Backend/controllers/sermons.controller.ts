import { Request, Response } from 'express';
import db from '../models/database.ts';
import { sendSuccess, sendError } from '../utils/helpers.ts';

export const getAll = async (_req: Request, res: Response) => {
  try {
    const rows = await db.many('SELECT * FROM sermons ORDER BY created_at DESC');
    sendSuccess(res, rows, 'Enseignements récupérés.');
  } catch (error: any) {
    console.error('Erreur lors de la récupération des enseignements:', error);
    sendError(res, 'Impossible de récupérer les enseignements.');
  }
};

export const create = async (req: Request, res: Response) => {
  const { titre, verset, description, chemin, date, auteur, categorie, image_url, auto_delete, delete_after_days } = req.body;
  const autoDelete = auto_delete === true || auto_delete === 'true';
  const deleteAfterDays = delete_after_days !== undefined && delete_after_days !== null
    ? Number(delete_after_days)
    : null;
  try {
    const result = await db.one<{ id: number }>(
      `
        INSERT INTO sermons (titre, verset, description, chemin, image_url, date, auteur, categorie, auto_delete, delete_after_days)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `,
      [titre, verset, description, chemin, image_url ?? null, date, auteur, categorie, autoDelete, deleteAfterDays]
    );
    sendSuccess(res, { id: result.id }, 'Enseignement ajouté.', 201);
  } catch (error: any) {
    console.error('Erreur lors de l’ajout de l’enseignement:', error);
    sendError(res, 'Impossible d’ajouter l’enseignement.');
  }
};

export const update = async (req: Request, res: Response) => {
  const { titre, verset, description, chemin, date, auteur, categorie, image_url, auto_delete, delete_after_days } = req.body;
  const autoDelete = typeof auto_delete !== 'undefined' ? auto_delete === true || auto_delete === 'true' : null;
  const deleteAfterDays = typeof delete_after_days !== 'undefined'
    ? delete_after_days !== null
      ? Number(delete_after_days)
      : null
    : undefined;
  try {
    const result = await db.run(
      `
        UPDATE sermons
        SET titre = $1, verset = $2, description = $3, chemin = $4, image_url = $5,
            date = $6, auteur = $7, categorie = $8, auto_delete = COALESCE($9, auto_delete),
            delete_after_days = CASE WHEN $10 IS NOT NULL THEN $10 ELSE delete_after_days END,
            updated_at = now()
        WHERE id = $11
      `,
      [titre, verset, description, chemin, image_url ?? null, date, auteur, categorie, autoDelete, deleteAfterDays, req.params.id]
    );
    if (result.changes === 0) return sendError(res, 'Enseignement introuvable.', 404);
    sendSuccess(res, null, 'Enseignement mis à jour.');
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l’enseignement:', error);
    sendError(res, 'Impossible de mettre à jour l’enseignement.');
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const result = await db.run('DELETE FROM sermons WHERE id = $1', [req.params.id]);
    if (result.changes === 0) return sendError(res, 'Enseignement introuvable.', 404);
    sendSuccess(res, null, 'Enseignement supprimé.');
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l’enseignement:', error);
    sendError(res, 'Impossible de supprimer l’enseignement.');
  }
};
