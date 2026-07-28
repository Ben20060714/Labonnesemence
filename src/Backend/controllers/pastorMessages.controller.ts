import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database.ts';
import { AuthRequest, PastorMessage } from '../types/index.ts';
import { sendError, sendSuccess } from '../utils/helpers.ts';

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await db.many<PastorMessage>(
      'SELECT id, title, content, label, author, created_at, updated_at FROM pastor_messages ORDER BY created_at DESC'
    );
    sendSuccess(res, messages, 'Messages du pasteur récupérés.');
  } catch (error: any) {
    console.error('Erreur lors de la récupération des messages du pasteur:', error);
    sendError(res, 'Impossible de récupérer les messages du pasteur.', 500);
  }
};

export const getMessageById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const message = await db.maybeOne<PastorMessage>(
      'SELECT id, title, content, label, author, created_at, updated_at FROM pastor_messages WHERE id = $1',
      [req.params.id]
    );

    if (!message) {
      sendError(res, 'Message du pasteur introuvable.', 404);
      return;
    }

    sendSuccess(res, message);
  } catch (error: any) {
    console.error('Erreur lors de la récupération du message du pasteur:', error);
    sendError(res, 'Impossible de récupérer le message du pasteur.', 500);
  }
};

export const createMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, label, author } = req.body as {
    title?: string;
    content?: string;
    label?: string;
    author?: string;
  };

  const payload = {
    title: title?.trim() || '',
    content: content?.trim() || '',
    label: label?.trim() || '',
    author: author?.trim() || '',
  };

  if (!payload.title || !payload.content || !payload.label || !payload.author) {
    sendError(res, 'Le titre, le contenu, le libellé et l’auteur sont requis.');
    return;
  }

  try {
    const id = uuidv4();
    await db.query(
      `INSERT INTO pastor_messages (id, title, content, label, author) VALUES ($1, $2, $3, $4, $5)`,
      [id, payload.title, payload.content, payload.label, payload.author]
    );

    const created = await db.one<PastorMessage>(
      'SELECT id, title, content, label, author, created_at, updated_at FROM pastor_messages WHERE id = $1',
      [id]
    );

    sendSuccess(res, created, 'Message du pasteur créé.', 201);
  } catch (error: any) {
    console.error('Erreur lors de la création du message du pasteur:', error);
    sendError(res, 'Impossible de créer le message du pasteur.', 500);
  }
};

export const updateMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, label, author } = req.body as {
    title?: string;
    content?: string;
    label?: string;
    author?: string;
  };

  if (!title?.trim() && !content?.trim() && !label?.trim() && !author?.trim()) {
    sendError(res, 'Au moins un champ doit être fourni pour la mise à jour.');
    return;
  }

  try {
    const existing = await db.maybeOne<PastorMessage>(
      'SELECT id FROM pastor_messages WHERE id = $1',
      [req.params.id]
    );

    if (!existing) {
      sendError(res, 'Message du pasteur introuvable.', 404);
      return;
    }

    const updatedTitle = title?.trim() || undefined;
    const updatedContent = content?.trim() || undefined;
    const updatedLabel = label?.trim() || undefined;
    const updatedAuthor = author?.trim() || undefined;

    await db.query(
      `UPDATE pastor_messages
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           label = COALESCE($3, label),
           author = COALESCE($4, author),
           updated_at = now()
       WHERE id = $5`,
      [updatedTitle, updatedContent, updatedLabel, updatedAuthor, req.params.id]
    );

    const updated = await db.one<PastorMessage>(
      'SELECT id, title, content, label, author, created_at, updated_at FROM pastor_messages WHERE id = $1',
      [req.params.id]
    );

    sendSuccess(res, updated, 'Message du pasteur mis à jour.');
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du message du pasteur:', error);
    sendError(res, 'Impossible de mettre à jour le message du pasteur.', 500);
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.run('DELETE FROM pastor_messages WHERE id = $1', [req.params.id]);
    if (result.changes === 0) {
      sendError(res, 'Message du pasteur introuvable.', 404);
      return;
    }

    sendSuccess(res, null, 'Message du pasteur supprimé.');
  } catch (error: any) {
    console.error('Erreur lors de la suppression du message du pasteur:', error);
    sendError(res, 'Impossible de supprimer le message du pasteur.', 500);
  }
};
