import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { AuthRequest, DailyDevotion, PaginatedResponse, PaginationQuery } from '../types';
import { parsePagination, sendError, sendSuccess } from '../utils/helpers';

type FormulaireDevotion = {
  scheduled_date?: string;
  verse_reference?: string;
  verse_text?: string;
  meditation_text?: string;
  prayer_text?: string;
  is_published?: boolean;
};

const selectionDevotion = `
  id, scheduled_date, verse_reference, verse_text, meditation_text,
  prayer_text, is_published, created_at, updated_at
`;

function nettoyerDate(date?: string): string | null {
  if (!date?.trim()) return null;
  const valeur = date.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(valeur) ? valeur : null;
}

export async function getCurrentDevotion(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const devotion = await db.maybeOne<DailyDevotion>(
      `SELECT ${selectionDevotion}
       FROM daily_devotions
       WHERE is_published = true AND scheduled_date <= CURRENT_DATE
       ORDER BY scheduled_date DESC, created_at DESC
       LIMIT 1`
    );

    sendSuccess(res, devotion || null, devotion ? 'Dévotion du jour récupérée.' : 'Aucune dévotion publiée.');
  } catch (error) {
    console.error('Erreur lors de la récupération de la dévotion du jour:', error);
    sendError(res, 'Impossible de récupérer la dévotion du jour.');
  }
}

export async function getDevotions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { page, limit, offset } = parsePagination(req.query as PaginationQuery);
    const total = Number((await db.one<{ count: string }>('SELECT COUNT(*) AS count FROM daily_devotions')).count);
    const items = await db.many<DailyDevotion>(
      `SELECT ${selectionDevotion}
       FROM daily_devotions
       ORDER BY scheduled_date DESC, created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    sendSuccess(res, { items, total, page, limit, totalPages: Math.ceil(total / limit) } satisfies PaginatedResponse<DailyDevotion>);
  } catch (error) {
    console.error('Erreur lors de la récupération des dévotions:', error);
    sendError(res, 'Impossible de récupérer les dévotions.');
  }
}

export async function createDevotion(req: AuthRequest, res: Response): Promise<void> {
  const body = req.body as FormulaireDevotion;
  const scheduledDate = nettoyerDate(body.scheduled_date);
  const verseReference = body.verse_reference?.trim();
  const verseText = body.verse_text?.trim();
  const meditationText = body.meditation_text?.trim();
  const prayerText = body.prayer_text?.trim();

  if (!scheduledDate || !verseReference || !verseText || !prayerText) {
    sendError(res, 'La date, la référence, le verset et la prière sont requis.');
    return;
  }

  try {
    const id = uuidv4();
    const devotion = await db.one<DailyDevotion>(
      `INSERT INTO daily_devotions
        (id, scheduled_date, verse_reference, verse_text, meditation_text, prayer_text, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${selectionDevotion}`,
      [id, scheduledDate, verseReference, verseText, meditationText || '', prayerText, body.is_published !== false]
    );

    sendSuccess(res, devotion, 'Dévotion programmée.', 201);
  } catch (error) {
    console.error('Erreur lors de la création de la dévotion:', error);
    sendError(res, 'Impossible de programmer la dévotion. La date est peut-être déjà utilisée.');
  }
}

export async function updateDevotion(req: AuthRequest, res: Response): Promise<void> {
  const body = req.body as Partial<FormulaireDevotion>;
  const scheduledDate = body.scheduled_date === undefined ? undefined : nettoyerDate(body.scheduled_date);

  if (body.scheduled_date !== undefined && !scheduledDate) {
    sendError(res, 'La date doit être au format AAAA-MM-JJ.');
    return;
  }

  try {
    const devotion = await db.maybeOne<DailyDevotion>(
      `UPDATE daily_devotions
       SET scheduled_date = COALESCE($1, scheduled_date),
           verse_reference = COALESCE($2, verse_reference),
           verse_text = COALESCE($3, verse_text),
           meditation_text = COALESCE($4, meditation_text),
           prayer_text = COALESCE($5, prayer_text),
           is_published = COALESCE($6, is_published),
           updated_at = now()
       WHERE id = $7
       RETURNING ${selectionDevotion}`,
      [
        scheduledDate ?? null,
        body.verse_reference?.trim() || null,
        body.verse_text?.trim() || null,
        body.meditation_text?.trim() || null,
        body.prayer_text?.trim() || null,
        typeof body.is_published === 'boolean' ? body.is_published : null,
        req.params.id,
      ]
    );

    if (!devotion) {
      sendError(res, 'Dévotion introuvable.', 404);
      return;
    }

    sendSuccess(res, devotion, 'Dévotion mise à jour.');
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la dévotion:', error);
    sendError(res, 'Impossible de mettre à jour la dévotion.');
  }
}

export async function deleteDevotion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await db.query('DELETE FROM daily_devotions WHERE id = $1', [req.params.id]);
    if (!result.rowCount) {
      sendError(res, 'Dévotion introuvable.', 404);
      return;
    }

    sendSuccess(res, null, 'Dévotion supprimée.');
  } catch (error) {
    console.error('Erreur lors de la suppression de la dévotion:', error);
    sendError(res, 'Impossible de supprimer la dévotion.');
  }
}
