import { Request, Response } from 'express';
import db from '../models/database.ts';
import { sendSuccess, sendError } from '../utils/helpers.ts';

export const getAll = async (_req: Request, res: Response) => {
  try {
    const rows = await db.many('SELECT * FROM events ORDER BY date ASC');
    sendSuccess(res, rows, 'Activités récupérées.');
  } catch (error: any) {
    console.error('Erreur lors de la récupération des activités:', error);
    sendError(res, 'Impossible de récupérer les activités.');
  }
};

export const create = async (req: Request, res: Response) => {
  const { titre, lieu, description, categorie, heure, date, image_url } = req.body;
  try {
    const result = await db.one<{ id: number }>(
      `
        INSERT INTO events (titre, lieu, description, image_url, categorie, heure, date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
      [titre, lieu, description, image_url ?? null, categorie, heure, date]
    );
    sendSuccess(res, { id: result.id }, 'Activité créée.', 201);
  } catch (error: any) {
    console.error('Erreur lors de la création de l’activité:', error);
    sendError(res, 'Impossible de créer l’activité.');
  }
};

export const update = async (req: Request, res: Response) => {
  const { titre, lieu, description, categorie, heure, date, image_url } = req.body;
  try {
    const result = await db.run(
      `
        UPDATE events
        SET titre = $1, lieu = $2, description = $3, image_url = $4, categorie = $5,
            heure = $6, date = $7, updated_at = now()
        WHERE id = $8
      `,
      [titre, lieu, description, image_url ?? null, categorie, heure, date, req.params.id]
    );
    if (result.changes === 0) return sendError(res, 'Activité introuvable.', 404);
    sendSuccess(res, null, 'Activité mise à jour.');
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l’activité:', error);
    sendError(res, 'Impossible de mettre à jour l’activité.');
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const result = await db.run('DELETE FROM events WHERE id = $1', [req.params.id]);
    if (result.changes === 0) return sendError(res, 'Activité introuvable.', 404);
    sendSuccess(res, null, 'Activité supprimée.');
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l’activité:', error);
    sendError(res, 'Impossible de supprimer l’activité.');
  }
};
