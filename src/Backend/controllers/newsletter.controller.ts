import { Request, Response } from 'express';
import { isValidEmail, sendError, sendSuccess } from '../utils/helpers.ts';
import {
  creerSujetNewsletterConfirmation,
  creerSujetNewsletterNotification,
  envoyerMail,
  obtenirDestinataireNewsletter,
} from '../utils/mailer.ts';

export const subscribe = async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  const adresse = email?.trim().toLowerCase() || '';

  if (!adresse) {
    sendError(res, 'Adresse e-mail requise.');
    return;
  }

  if (!isValidEmail(adresse)) {
    sendError(res, 'Adresse e-mail invalide.');
    return;
  }

  try {
    const destinataire = obtenirDestinataireNewsletter();
    const promesses = [
      envoyerMail({
        to: adresse,
        subject: creerSujetNewsletterConfirmation(),
        text: `Bonjour,\n\nVotre inscription à la newsletter Bonne Semence a bien été prise en compte pour ${adresse}.\nVous recevrez les prochaines communications de l'église à cette adresse.\n\nBonne paix à vous.`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
            <h2 style="margin:0 0 12px">Inscription confirmée</h2>
            <p>Votre inscription à la newsletter Bonne Semence a bien été prise en compte pour <strong>${adresse}</strong>.</p>
            <p>Vous recevrez les prochaines communications de l'église à cette adresse.</p>
          </div>
        `,
      }),
    ];

    if (destinataire) {
      promesses.push(
        envoyerMail({
          to: destinataire,
          replyTo: adresse,
          subject: creerSujetNewsletterNotification(),
          text: `Nouvelle inscription newsletter: ${adresse}`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
              <h2 style="margin:0 0 12px">Nouvelle inscription newsletter</h2>
              <p>L'adresse <strong>${adresse}</strong> vient de s'inscrire à la newsletter.</p>
            </div>
          `,
        })
      );
    }

    await Promise.allSettled(promesses);
    sendSuccess(res, { email: adresse }, 'Inscription à la newsletter enregistrée.', 201);
  } catch (error) {
    console.error('Erreur lors de l’envoi de la newsletter:', error);
    sendError(res, "L'inscription a été prise en compte, mais l'envoi du courriel a échoué.", 503);
  }
};

