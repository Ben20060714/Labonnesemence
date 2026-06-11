import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database.ts';
import { isValidEmail, sendError, sendSuccess } from '../utils/helpers.ts';

export const create = (req: Request, res: Response) => {
  const { nom, email, sujet, contenu } = req.body as {
    nom?: string;
    email?: string;
    sujet?: string;
    contenu?: string;
  };

  const valeurs = {
    nom: nom?.trim() || '',
    email: email?.trim().toLowerCase() || '',
    sujet: sujet?.trim() || '',
    contenu: contenu?.trim() || '',
  };

  if (!valeurs.nom || !valeurs.email || !valeurs.sujet || !valeurs.contenu) {
    sendError(res, 'Tous les champs du formulaire de contact sont requis.');
    return;
  }

  if (!isValidEmail(valeurs.email)) {
    sendError(res, 'Adresse email invalide.');
    return;
  }

  try {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO contact_messages (id, nom, email, sujet, contenu)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, valeurs.nom, valeurs.email, valeurs.sujet, valeurs.contenu);

    const message = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id);
    sendSuccess(res, message, 'Message de contact enregistré.', 201);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const getAll = (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
    sendSuccess(res, rows, 'Messages de contact récupérés.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const remove = (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM contact_messages WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      sendError(res, 'Message de contact introuvable.', 404);
      return;
    }

    sendSuccess(res, null, 'Message de contact supprimé.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};
