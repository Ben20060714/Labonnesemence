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
  audio_url?: string | null;
  audio_title?: string | null;
  audio_description?: string | null;
  cover_image_url?: string | null;
  is_published?: boolean;
};

const selectionDevotion = `
  id, scheduled_date, verse_reference, verse_text, meditation_text,
  prayer_text, audio_url, audio_title, audio_description, cover_image_url,
  is_published, created_at, updated_at
`;

function nettoyerDate(date?: string): string | null {
  if (!date?.trim()) return null;
  const valeur = date.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(valeur) ? valeur : null;
}

function nettoyerChampTexte(valeur: string | null | undefined): string | null | undefined {
  if (valeur === undefined) return undefined;
  if (valeur === null) return null;
  return valeur.trim();
}

function nettoyerChampNullable(valeur: string | null | undefined): string | null | undefined {
  if (valeur === undefined) return undefined;
  if (valeur === null) return null;
  return valeur.trim() || null;
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
  const audioUrl = body.audio_url?.trim() || null;
  const audioTitle = body.audio_title?.trim() || null;
  const audioDescription = body.audio_description?.trim() || null;
  const coverImageUrl = body.cover_image_url?.trim() || null;

  if (!scheduledDate || !verseReference || !verseText || !prayerText) {
    sendError(res, 'La date, la référence, le verset et la prière sont requis.');
    return;
  }

  try {
    const id = uuidv4();
    const devotion = await db.one<DailyDevotion>(
      `INSERT INTO daily_devotions
        (id, scheduled_date, verse_reference, verse_text, meditation_text, prayer_text, audio_url, audio_title, audio_description, cover_image_url, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${selectionDevotion}`,
      [id, scheduledDate, verseReference, verseText, meditationText || '', prayerText, audioUrl, audioTitle, audioDescription, coverImageUrl, body.is_published !== false]
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
  const verseReference = nettoyerChampTexte(body.verse_reference);
  const verseText = nettoyerChampTexte(body.verse_text);
  const meditationText = nettoyerChampTexte(body.meditation_text);
  const prayerText = nettoyerChampTexte(body.prayer_text);
  const audioUrl = nettoyerChampNullable(body.audio_url);
  const audioTitle = nettoyerChampNullable(body.audio_title);
  const audioDescription = nettoyerChampNullable(body.audio_description);
  const coverImageUrl = nettoyerChampNullable(body.cover_image_url);

  if (body.scheduled_date !== undefined && !scheduledDate) {
    sendError(res, 'La date doit être au format AAAA-MM-JJ.');
    return;
  }

  try {
    const devotion = await db.maybeOne<DailyDevotion>(
      `UPDATE daily_devotions
       SET scheduled_date = CASE WHEN $1 THEN $2 ELSE scheduled_date END,
           verse_reference = CASE WHEN $3 THEN $4 ELSE verse_reference END,
           verse_text = CASE WHEN $5 THEN $6 ELSE verse_text END,
           meditation_text = CASE WHEN $7 THEN $8 ELSE meditation_text END,
           prayer_text = CASE WHEN $9 THEN $10 ELSE prayer_text END,
           audio_url = CASE WHEN $11 THEN $12 ELSE audio_url END,
           audio_title = CASE WHEN $13 THEN $14 ELSE audio_title END,
           audio_description = CASE WHEN $15 THEN $16 ELSE audio_description END,
           cover_image_url = CASE WHEN $17 THEN $18 ELSE cover_image_url END,
           is_published = CASE WHEN $19 THEN $20 ELSE is_published END,
           updated_at = now()
       WHERE id = $21
       RETURNING ${selectionDevotion}`,
      [
        body.scheduled_date !== undefined,
        scheduledDate ?? null,
        body.verse_reference !== undefined,
        verseReference ?? null,
        body.verse_text !== undefined,
        verseText ?? null,
        body.meditation_text !== undefined,
        meditationText ?? '',
        body.prayer_text !== undefined,
        prayerText ?? null,
        body.audio_url !== undefined,
        audioUrl ?? null,
        body.audio_title !== undefined,
        audioTitle ?? null,
        body.audio_description !== undefined,
        audioDescription ?? null,
        body.cover_image_url !== undefined,
        coverImageUrl ?? null,
        typeof body.is_published === 'boolean',
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
