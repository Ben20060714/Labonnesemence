import { Request, Response } from 'express';
import db from '../models/database.ts';
import { sendSuccess, sendError } from '../utils/helpers.ts';

export const getAll = (req: Request, res: Response) => {
    try {
        const rows = db.prepare('SELECT * FROM sermons ORDER BY created_at DESC').all();
        sendSuccess(res, rows, 'Enseignements récupérés');
    } catch (error: any) {
        sendError(res, error.message);
    }
};

export const create = (req: Request, res: Response) => {
    const { titre, verset, description, chemin, date, auteur, categorie } = req.body;
    try {
        const stmt = db.prepare(`
      INSERT INTO sermons (titre, verset, description, chemin, date, auteur, categorie)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(titre, verset, description, chemin, date, auteur, categorie);
        sendSuccess(res, { id: result.lastInsertRowid }, 'Enseignement ajouté', 201);
    } catch (error: any) {
        sendError(res, error.message);
    }
};

export const update = (req: Request, res: Response) => {
    const { titre, verset, description, chemin, date, auteur, categorie } = req.body;
    try {
        const stmt = db.prepare(`
      UPDATE sermons 
      SET titre = ?, verset = ?, description = ?, chemin = ?, date = ?, auteur = ?, categorie = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
        const result = stmt.run(titre, verset, description, chemin, date, auteur, categorie, req.params.id);
        if (result.changes === 0) return sendError(res, 'Enseignement non trouvé', 404);
        sendSuccess(res, null, 'Enseignement mis à jour');
    } catch (error: any) {
        sendError(res, error.message);
    }
};

export const remove = (req: Request, res: Response) => {
    try {
        const result = db.prepare('DELETE FROM sermons WHERE id = ?').run(req.params.id);
        if (result.changes === 0) return sendError(res, 'Enseignement non trouvé', 404);
        sendSuccess(res, null, 'Enseignement supprimé');
    } catch (error: any) {
        sendError(res, error.message);
    }
};