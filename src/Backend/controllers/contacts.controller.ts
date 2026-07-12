import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database.ts';
import { isValidEmail, sendError, sendSuccess } from '../utils/helpers.ts';

export const create = async (req: Request, res: Response) => {
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
    await db.query(
      `
        INSERT INTO contact_messages (id, nom, email, sujet, contenu)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [id, valeurs.nom, valeurs.email, valeurs.sujet, valeurs.contenu]
    );

    const message = await db.one('SELECT * FROM contact_messages WHERE id = $1', [id]);
    sendSuccess(res, message, 'Message de contact enregistre.', 201);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const getAll = async (_req: Request, res: Response) => {
  try {
    const rows = await db.many('SELECT * FROM contact_messages ORDER BY created_at DESC');
    sendSuccess(res, rows, 'Messages de contact recuperes.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const result = await db.run('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
    if (result.changes === 0) {
      sendError(res, 'Message de contact introuvable.', 404);
      return;
    }

    sendSuccess(res, null, 'Message de contact supprime.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};
