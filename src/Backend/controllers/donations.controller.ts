import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database.ts';
import { isValidEmail, sendError, sendSuccess } from '../utils/helpers.ts';

const MONETBIL_SERVICE_KEY = process.env.MONETBIL_SERVICE_KEY || 'Tr36XiIBha8vBJcx2pEZEzx2RINEZIcR';
const MONETBIL_PAYMENT_URL = process.env.MONETBIL_PAYMENT_URL || 'https://www.monetbil.com/widget/v2.1/';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const PUBLIC_API_URL = process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 5000}`;

type DonationStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

const statutsValides: DonationStatus[] = ['pending', 'paid', 'failed', 'cancelled'];

const normaliserStatutMonetbil = (payload: Record<string, unknown>): DonationStatus => {
  const valeur = String(
    payload.status ||
    payload.payment_status ||
    payload.transaction_status ||
    payload.state ||
    ''
  ).toLowerCase();

  if (['success', 'successful', 'paid', 'completed', 'complete', 'accepted'].includes(valeur)) return 'paid';
  if (['failed', 'failure', 'error', 'rejected', 'declined'].includes(valeur)) return 'failed';
  if (['cancelled', 'canceled', 'cancel'].includes(valeur)) return 'cancelled';
  return 'pending';
};

const trouverReference = (payload: Record<string, unknown>) => {
  return String(
    payload.reference ||
    payload.payment_ref ||
    payload.transaction_ref ||
    payload.item_ref ||
    payload.monetbil_item_ref ||
    payload.order_id ||
    ''
  ).trim();
};

const trouverTransactionProvider = (payload: Record<string, unknown>) => {
  const valeur = payload.transaction_id || payload.payment_id || payload.operator_transaction_id || payload.channel_transaction_id;
  return valeur ? String(valeur) : null;
};

export const getMonetbilConfig = (_req: Request, res: Response) => {
  sendSuccess(res, {
    serviceKey: MONETBIL_SERVICE_KEY,
    paymentUrl: MONETBIL_PAYMENT_URL,
    notifyUrl: `${PUBLIC_API_URL}/api/donations/monetbil/notify`,
    returnUrl: FRONTEND_URL,
    cancelUrl: FRONTEND_URL,
  });
};

export const create = (req: Request, res: Response) => {
  const { donorName, donorEmail, donorPhone, amount, designation, description } = req.body as {
    donorName?: string;
    donorEmail?: string;
    donorPhone?: string;
    amount?: number;
    designation?: string;
    description?: string;
  };

  const donnees = {
    donorName: donorName?.trim() || '',
    donorEmail: donorEmail?.trim().toLowerCase() || '',
    donorPhone: donorPhone?.trim() || '',
    amount: Number(amount),
    designation: designation?.trim() || 'Don CABCS',
    description: description?.trim() || '',
  };

  if (!donnees.donorName || !donnees.donorEmail || !donnees.donorPhone) {
    sendError(res, 'Nom, email et téléphone du donateur sont requis.');
    return;
  }

  if (!isValidEmail(donnees.donorEmail)) {
    sendError(res, 'Adresse email invalide.');
    return;
  }

  if (!Number.isInteger(donnees.amount) || donnees.amount < 1) {
    sendError(res, 'Montant de don invalide.');
    return;
  }

  try {
    const id = uuidv4();
    const reference = `DON-${Date.now()}-${id.slice(0, 8).toUpperCase()}`;

    db.prepare(`
      INSERT INTO donations (
        id, reference, donor_name, donor_email, donor_phone, amount, designation, description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      reference,
      donnees.donorName,
      donnees.donorEmail,
      donnees.donorPhone,
      donnees.amount,
      donnees.designation,
      donnees.description
    );

    const donation = db.prepare('SELECT * FROM donations WHERE id = ?').get(id);
    sendSuccess(res, donation, 'Don préparé.', 201);
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const notifyMonetbil = (req: Request, res: Response) => {
  const payload = { ...req.query, ...req.body } as Record<string, unknown>;
  const reference = trouverReference(payload);

  if (!reference) {
    sendError(res, 'Référence de paiement manquante.');
    return;
  }

  try {
    const donation = db.prepare('SELECT id FROM donations WHERE reference = ?').get(reference) as { id: string } | undefined;
    if (!donation) {
      sendError(res, 'Don introuvable.', 404);
      return;
    }

    db.prepare(`
      UPDATE donations
      SET status = ?, provider_transaction_id = ?, provider_payload = ?, updated_at = datetime('now')
      WHERE reference = ?
    `).run(
      normaliserStatutMonetbil(payload),
      trouverTransactionProvider(payload),
      JSON.stringify(payload),
      reference
    );

    sendSuccess(res, { received: true });
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const getAll = (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM donations ORDER BY created_at DESC').all();
    sendSuccess(res, rows, 'Dons récupérés.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};

export const updateStatus = (req: Request, res: Response) => {
  const { status } = req.body as { status?: DonationStatus };

  if (!status || !statutsValides.includes(status)) {
    sendError(res, 'Statut de don invalide.');
    return;
  }

  try {
    const result = db.prepare(`
      UPDATE donations
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(status, req.params.id);

    if (result.changes === 0) {
      sendError(res, 'Don introuvable.', 404);
      return;
    }

    const donation = db.prepare('SELECT * FROM donations WHERE id = ?').get(req.params.id);
    sendSuccess(res, donation, 'Statut du don mis à jour.');
  } catch (error: any) {
    sendError(res, error.message, 500);
  }
};
