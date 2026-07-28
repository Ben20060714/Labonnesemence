import fs from 'fs/promises';
import path from 'path';
import db from '../models/database.ts';
import { supabase, supabaseBucket } from './supabase.ts';

interface DeletableEntity {
  id: number | string;
  chemin?: string | null;
  image_url?: string | null;
}

const LOCAL_UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');

function parseFileIdFromUrl(url?: string | null): string | null {
  if (!url) return null;

  try {
    const normalized = url.trim();
    const parsedUrl = normalized.startsWith('http://') || normalized.startsWith('https://')
      ? new URL(normalized).pathname
      : normalized;

    const match = parsedUrl.match(/(?:\/files\/|\/api\/files\/)([^\/]+)\/(?:stream|download)(?:$|[\?\/])/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function resolveLocalFilePath(reference?: string | null): string | null {
  if (!reference) return null;
  let relative = reference.replace(/\\/g, '/').trim();

  if (relative.startsWith('http://') || relative.startsWith('https://')) {
    try {
      relative = new URL(relative).pathname;
    } catch {
      return null;
    }
  }

  if (relative.startsWith('/')) {
    relative = relative.slice(1);
  }

  if (!relative.includes('uploads/')) {
    return null;
  }

  return path.resolve(process.cwd(), relative);
}

async function removeSupabaseFileById(fileId: string): Promise<void> {
  const file = await db.maybeOne<{ filename: string }>('SELECT filename FROM files WHERE id = $1', [fileId]);
  if (!file?.filename) return;

  const { error } = await supabase.storage.from(supabaseBucket).remove([file.filename]);
  if (error) {
    console.error(`Erreur lors de la suppression du fichier Supabase ${file.filename}:`, error.message);
  }

  await db.query('DELETE FROM files WHERE id = $1', [fileId]);
}

async function removeLocalFile(reference?: string | null): Promise<void> {
  const localPath = resolveLocalFilePath(reference);
  if (!localPath) return;

  try {
    await fs.unlink(localPath);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error(`Erreur lors de la suppression du fichier local ${localPath}:`, error.message);
    }
  }
}

async function removeAssociatedFile(reference?: string | null): Promise<void> {
  if (!reference) return;

  const fileId = parseFileIdFromUrl(reference);
  if (fileId) {
    await removeSupabaseFileById(fileId);
    return;
  }

  await removeLocalFile(reference);
}

async function cleanTable(tableName: string): Promise<number> {
  const rows = await db.many<DeletableEntity>(
    `
      SELECT id, chemin, image_url
      FROM ${tableName}
      WHERE auto_delete = true
        AND delete_after_days IS NOT NULL
        AND now() >= created_at + delete_after_days * INTERVAL '1 day'
    `
  );

  for (const row of rows) {
    await removeAssociatedFile(row.image_url);
    await removeAssociatedFile(row.chemin);
  }

  if (rows.length === 0) {
    return 0;
  }

  const ids = rows.map((row) => row.id);
  await db.query(
    `DELETE FROM ${tableName} WHERE id = ANY($1)`,
    [ids]
  );

  return rows.length;
}

async function cleanPastorMessages(): Promise<number> {
  const rows = await db.many<{ id: string }>(
    `
      SELECT id
      FROM pastor_messages
      WHERE auto_delete = true
        AND delete_after_days IS NOT NULL
        AND now() >= created_at + delete_after_days * INTERVAL '1 day'
    `
  );

  if (rows.length === 0) {
    return 0;
  }

  const ids = rows.map((row) => row.id);
  await db.query('DELETE FROM pastor_messages WHERE id = ANY($1)', [ids]);

  return rows.length;
}

export async function cleanExpiredAutoDeleteEntities(): Promise<void> {
  try {
    const sermonsDeleted = await cleanTable('sermons');
    const eventsDeleted = await cleanTable('events');
    const pastorMessagesDeleted = await cleanPastorMessages();

    console.log(`Tâche de nettoyage exécutée: ${sermonsDeleted} sermons, ${eventsDeleted} événements, ${pastorMessagesDeleted} mots du pasteur supprimés.`);
  } catch (error: any) {
    console.error('Erreur lors du nettoyage des entités auto-delete:', error);
    throw error;
  }
}

function getNextRunDelay(hour = 3, minute = 0): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return Math.max(0, next.getTime() - now.getTime());
}

export function scheduleDailyCleanup(): void {
  const schedule = async () => {
    try {
      await cleanExpiredAutoDeleteEntities();
    } catch (error: any) {
      console.error('La tâche de nettoyage a échoué:', error);
    } finally {
      setTimeout(schedule, 24 * 60 * 60 * 1000);
    }
  };

  const delay = getNextRunDelay(3, 0);
  console.log(`Nettoyage automatique planifié dans ${Math.round(delay / 1000 / 60)} minutes.`);
  setTimeout(schedule, delay);
}
