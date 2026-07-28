import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database.ts';
import { AuthRequest, PastorMessage } from '../types/index.ts';
import { sendError, sendSuccess } from '../utils/helpers.ts';
import { sendTopicNotification } from '../utils/firebase.ts';

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await db.many<PastorMessage>(
      'SELECT id, title, content, label, author, auto_delete, delete_after_days, created_at, updated_at FROM pastor_messages ORDER BY created_at DESC'
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
      'SELECT id, title, content, label, author, auto_delete, delete_after_days, created_at, updated_at FROM pastor_messages WHERE id = $1',
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
  const { title, content, label, author, auto_delete, delete_after_days } = req.body as {
    title?: string;
    content?: string;
    label?: string;
    author?: string;
    auto_delete?: boolean | string;
    delete_after_days?: number | string | null;
  };

  const payload = {
    title: title?.trim() || '',
    content: content?.trim() || '',
    label: label?.trim() || '',
    author: author?.trim() || '',
    auto_delete: auto_delete === true || auto_delete === 'true',
    delete_after_days: delete_after_days !== undefined && delete_after_days !== null
      ? Number(delete_after_days)
      : null,
  };

  if (!payload.title || !payload.content || !payload.label || !payload.author) {
    sendError(res, 'Le titre, le contenu, le libellé et l’auteur sont requis.');
    return;
  }

  try {
    const id = uuidv4();
    await db.query(
      `INSERT INTO pastor_messages (id, title, content, label, author, auto_delete, delete_after_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, payload.title, payload.content, payload.label, payload.author, payload.auto_delete, payload.delete_after_days]
    );

    const created = await db.one<PastorMessage>(
      'SELECT id, title, content, label, author, auto_delete, delete_after_days, created_at, updated_at FROM pastor_messages WHERE id = $1',
      [id]
    );

    sendSuccess(res, created, 'Message du pasteur créé.', 201);

    try {
      await sendTopicNotification('Nouveau Message du Pasteur !', payload.title || 'Un nouveau message du pasteur a été publié.');
    } catch (notificationError: any) {
      console.error('Notification Firebase Message du pasteur échouée:', notificationError);
    }
  } catch (error: any) {
    console.error('Erreur lors de la création du message du pasteur:', error);
    sendError(res, 'Impossible de créer le message du pasteur.', 500);
  }
};

export const updateMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, label, author, auto_delete, delete_after_days } = req.body as {
    title?: string;
    content?: string;
    label?: string;
    author?: string;
    auto_delete?: boolean | string;
    delete_after_days?: number | string | null;
  };

  if (!title?.trim() && !content?.trim() && !label?.trim() && !author?.trim() && typeof auto_delete === 'undefined' && typeof delete_after_days === 'undefined') {
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
    const updatedAutoDelete = typeof auto_delete !== 'undefined' ? auto_delete === true || auto_delete === 'true' : undefined;
    const updatedDeleteAfterDays = typeof delete_after_days !== 'undefined'
      ? delete_after_days !== null
        ? Number(delete_after_days)
        : null
      : undefined;

    await db.query(
      `UPDATE pastor_messages
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           label = COALESCE($3, label),
           author = COALESCE($4, author),
           auto_delete = COALESCE($5, auto_delete),
           delete_after_days = CASE WHEN $6 IS NOT NULL THEN $6 ELSE delete_after_days END,
           updated_at = now()
       WHERE id = $7`,
      [updatedTitle, updatedContent, updatedLabel, updatedAuthor, updatedAutoDelete, updatedDeleteAfterDays, req.params.id]
    );

    const updated = await db.one<PastorMessage>(
      'SELECT id, title, content, label, author, auto_delete, delete_after_days, created_at, updated_at FROM pastor_messages WHERE id = $1',
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
