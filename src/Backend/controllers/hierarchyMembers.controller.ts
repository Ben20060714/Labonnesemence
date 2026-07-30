import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { AuthRequest, MembreHierarchie, PaginatedResponse, PaginationQuery } from '../types';
import { parsePagination, sendError, sendSuccess } from '../utils/helpers';

type FormulaireMembreHierarchie = {
  prenom?: string;
  nom?: string;
  fonction?: string;
  biographie?: string;
  email?: string | null;
  telephone?: string | null;
  afficher_coordonnees?: boolean;
  image_url?: string | null;
};

const selectionPublique = `
  id, prenom, nom, fonction, biographie, image_url, created_at
`;
const selectionAdministration = `
  id, prenom, nom, fonction, biographie, email, telephone,
  afficher_coordonnees, image_url, created_at, updated_at
`;

export async function getPublicHierarchyMembers(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = parsePagination(req.query as PaginationQuery);
  const total = Number((await db.one<{ count: string }>('SELECT COUNT(*) AS count FROM hierarchy_members')).count);
  const items = await db.many<MembreHierarchie>(
    `SELECT ${selectionPublique} FROM hierarchy_members ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  sendSuccess(res, { items, total, page, limit, totalPages: Math.ceil(total / limit) } satisfies PaginatedResponse<Partial<MembreHierarchie>>);
}

export async function getHierarchyMembers(req: AuthRequest, res: Response): Promise<void> {
  const { page, limit, offset } = parsePagination(req.query as PaginationQuery);
  const total = Number((await db.one<{ count: string }>('SELECT COUNT(*) AS count FROM hierarchy_members')).count);
  const items = await db.many<MembreHierarchie>(
    `SELECT ${selectionAdministration} FROM hierarchy_members ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  sendSuccess(res, { items, total, page, limit, totalPages: Math.ceil(total / limit) } satisfies PaginatedResponse<MembreHierarchie>);
}

export async function createHierarchyMember(req: AuthRequest, res: Response): Promise<void> {
  const body = req.body as FormulaireMembreHierarchie;
  const prenom = body.prenom?.trim();
  const nom = body.nom?.trim();
  const fonction = body.fonction?.trim();

  if (!prenom || !nom || !fonction) {
    sendError(res, 'Le prénom, le nom et la fonction sont requis.');
    return;
  }

  const id = uuidv4();
  await db.query(
    `INSERT INTO hierarchy_members
      (id, prenom, nom, fonction, biographie, email, telephone, afficher_coordonnees, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      id, prenom, nom, fonction, body.biographie?.trim() || '', body.email?.trim() || null,
      body.telephone?.trim() || null, Boolean(body.afficher_coordonnees), body.image_url || null,
    ]
  );

  const member = await db.one<MembreHierarchie>(`SELECT ${selectionAdministration} FROM hierarchy_members WHERE id = $1`, [id]);
  sendSuccess(res, member, 'Membre de la hiérarchie ajouté.', 201);
}

export async function deleteHierarchyMember(req: AuthRequest, res: Response): Promise<void> {
  const result = await db.query('DELETE FROM hierarchy_members WHERE id = $1', [req.params.id]);
  if (!result.rowCount) {
    sendError(res, 'Membre de la hiérarchie introuvable.', 404);
    return;
  }
  sendSuccess(res, null, 'Membre de la hiérarchie supprimé.');
}
