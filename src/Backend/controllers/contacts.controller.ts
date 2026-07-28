import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database.ts';
import { isValidEmail, sendError, sendSuccess } from '../utils/helpers.ts';
import {
  creerSujetAccuseContact,
  creerSujetNotificationContact,
  envoyerMail,
  obtenirDestinataireContact,
} from '../utils/mailer.ts';

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
    const destinataire = obtenirDestinataireContact();
    const envoi = [
      envoyerMail({
        to: destinataire,
        replyTo: valeurs.email,
        subject: creerSujetNotificationContact(valeurs.nom, valeurs.sujet),
        text: `Nouveau message de contact de ${valeurs.nom} <${valeurs.email}>.\n\nSujet: ${valeurs.sujet}\n\n${valeurs.contenu}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
            <h2 style="margin:0 0 12px">Nouveau message de contact</h2>
            <p><strong>Nom :</strong> ${valeurs.nom}</p>
            <p><strong>E-mail :</strong> ${valeurs.email}</p>
            <p><strong>Sujet :</strong> ${valeurs.sujet}</p>
            <p><strong>Message :</strong></p>
            <div style="white-space:pre-wrap">${valeurs.contenu}</div>
          </div>
        `,
      }),
      envoyerMail({
        to: valeurs.email,
        subject: creerSujetAccuseContact(),
        text: `Bonjour ${valeurs.nom},\n\nNous avons bien reçu votre message à propos de "${valeurs.sujet}". Nous vous répondrons dès que possible.\n\nMerci.`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
            <h2 style="margin:0 0 12px">Nous avons bien reçu votre message</h2>
            <p>Bonjour ${valeurs.nom},</p>
            <p>Nous avons bien reçu votre message à propos de <strong>${valeurs.sujet}</strong>.</p>
            <p>Nous vous répondrons dès que possible.</p>
          </div>
        `,
      }),
    ];

    const resultats = await Promise.allSettled(envoi);
    const toutEnvoye = resultats.every((resultat) => resultat.status === 'fulfilled');
    sendSuccess(
      res,
      { ...message, notificationEmailEnvoyee: toutEnvoye },
      toutEnvoye
        ? 'Message de contact enregistré et envoyé par e-mail.'
        : 'Message de contact enregistré, mais l’envoi par e-mail a été partiellement interrompu.',
      201
    );
  } catch (error: any) {
    console.error('Erreur lors du traitement du message de contact:', error);
    sendError(res, 'Impossible de traiter le message de contact pour le moment.', 500);
  }
};

export const getAll = async (_req: Request, res: Response) => {
  try {
    const rows = await db.many('SELECT * FROM contact_messages ORDER BY created_at DESC');
    sendSuccess(res, rows, 'Messages de contact récupérés.');
  } catch (error: any) {
    console.error('Erreur lors de la récupération des messages de contact:', error);
    sendError(res, 'Impossible de récupérer les messages de contact.', 500);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const result = await db.run('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
    if (result.changes === 0) {
      sendError(res, 'Message de contact introuvable.', 404);
      return;
    }

    sendSuccess(res, null, 'Message de contact supprimé.');
  } catch (error: any) {
    console.error('Erreur lors de la suppression du message de contact:', error);
    sendError(res, 'Impossible de supprimer le message de contact.', 500);
  }
};
