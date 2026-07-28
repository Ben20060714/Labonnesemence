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

export const create = async (req: Request, res: Response) => {
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
    sendError(res, 'Le nom, l’e-mail et le téléphone du donateur sont requis.');
    return;
  }

  if (!isValidEmail(donnees.donorEmail)) {
    sendError(res, 'Adresse e-mail invalide.');
    return;
  }

  if (!Number.isInteger(donnees.amount) || donnees.amount < 1) {
    sendError(res, 'Montant du don invalide.');
    return;
  }

  try {
    const id = uuidv4();
    const reference = `DON-${Date.now()}-${id.slice(0, 8).toUpperCase()}`;

    await db.query(
      `
        INSERT INTO donations (
          id, reference, donor_name, donor_email, donor_phone, amount, designation, description
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        id,
        reference,
        donnees.donorName,
        donnees.donorEmail,
        donnees.donorPhone,
        donnees.amount,
        donnees.designation,
        donnees.description,
      ]
    );

    const donation = await db.one('SELECT * FROM donations WHERE id = $1', [id]);
    sendSuccess(res, donation, 'Don préparé.', 201);
  } catch (error: any) {
    console.error('Erreur lors de la préparation du don:', error);
    sendError(res, 'Impossible de préparer le don.', 500);
  }
};

export const notifyMonetbil = async (req: Request, res: Response) => {
  const payload = { ...req.query, ...req.body } as Record<string, unknown>;
  const reference = trouverReference(payload);

  if (!reference) {
    sendError(res, 'Référence de paiement manquante.');
    return;
  }

  try {
    const donation = await db.maybeOne<{ id: string }>('SELECT id FROM donations WHERE reference = $1', [reference]);
    if (!donation) {
      sendError(res, 'Don introuvable.', 404);
      return;
    }

    await db.query(
      `
        UPDATE donations
        SET status = $1, provider_transaction_id = $2, provider_payload = $3, updated_at = now()
        WHERE reference = $4
      `,
      [normaliserStatutMonetbil(payload), trouverTransactionProvider(payload), JSON.stringify(payload), reference]
    );

    sendSuccess(res, { received: true });
  } catch (error: any) {
    console.error('Erreur lors de la notification Monetbil:', error);
    sendError(res, 'Impossible de traiter la notification de paiement.', 500);
  }
};

export const getAll = async (_req: Request, res: Response) => {
  try {
    const rows = await db.many('SELECT * FROM donations ORDER BY created_at DESC');
    sendSuccess(res, rows, 'Dons récupérés.');
  } catch (error: any) {
    console.error('Erreur lors de la récupération des dons:', error);
    sendError(res, 'Impossible de récupérer les dons.', 500);
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  const { status } = req.body as { status?: DonationStatus };

  if (!status || !statutsValides.includes(status)) {
    sendError(res, 'Statut de don invalide.');
    return;
  }

  try {
    const result = await db.run(
      `
        UPDATE donations
        SET status = $1, updated_at = now()
        WHERE id = $2
      `,
      [status, req.params.id]
    );

    if (result.changes === 0) {
      sendError(res, 'Don introuvable.', 404);
      return;
    }

    const donation = await db.one('SELECT * FROM donations WHERE id = $1', [req.params.id]);
    sendSuccess(res, donation, 'Statut du don mis à jour.');
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du statut du don:', error);
    sendError(res, 'Impossible de mettre à jour le statut du don.', 500);
  }
};
