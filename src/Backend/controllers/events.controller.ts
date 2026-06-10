import { Request, Response } from 'express';
import db from '../models/database.ts';
import { sendSuccess, sendError } from '../utils/helpers.ts';

export const getAll = (req: Request, res: Response) => {
    try {
        const rows = db.prepare('SELECT * FROM events ORDER BY date ASC').all();
        sendSuccess(res, rows, 'Activités récupérées');
    } catch (error: any) {
        sendError(res, error.message);
    }
};

export const create = (req: Request, res: Response) => {
    const { titre, lieu, description, categorie, heure, date } = req.body;
    try {
        const stmt = db.prepare(`
      INSERT INTO events (titre, lieu, description, categorie, heure, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(titre, lieu, description, categorie, heure, date);
        sendSuccess(res, { id: result.lastInsertRowid }, 'Activité créée', 201);
    } catch (error: any) {
        sendError(res, error.message);
    }
};

export const update = (req: Request, res: Response) => {
    const { titre, lieu, description, categorie, heure, date } = req.body;
    try {
        const stmt = db.prepare(`
      UPDATE events 
      SET titre = ?, lieu = ?, description = ?, categorie = ?, heure = ?, date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        const result = stmt.run(titre, lieu, description, categorie, heure, date, req.params.id);
        if (result.changes === 0) return sendError(res, 'Activité non trouvée', 404);
        sendSuccess(res, null, 'Activité mise à jour');
    } catch (error: any) {
        sendError(res, error.message);
    }
};

export const remove = (req: Request, res: Response) => {
    try {
        const result = db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
        if (result.changes === 0) return sendError(res, 'Activité non trouvée', 404);
        sendSuccess(res, null, 'Activité supprimée');
    } catch (error: any) {
        sendError(res, error.message);
    }
};