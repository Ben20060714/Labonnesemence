import nodemailer from 'nodemailer';
import type { SendMailOptions, Transporter } from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST?.trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = (process.env.SMTP_SECURE || '').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER?.trim();
const SMTP_PASS = process.env.SMTP_PASS?.trim();
const SMTP_FROM = process.env.SMTP_FROM?.trim();
const CONTACT_RECIPIENT_EMAIL = process.env.CONTACT_RECIPIENT_EMAIL?.trim() || SMTP_USER || '';
const NEWSLETTER_RECIPIENT_EMAIL = process.env.NEWSLETTER_RECIPIENT_EMAIL?.trim() || CONTACT_RECIPIENT_EMAIL;

let transporteur: Transporter | null = null;

function obtenirAdresseExpediteur(): string {
  return SMTP_FROM || SMTP_USER || 'no-reply@labonnesemence.local';
}

function obtenirTransporteur(): Transporter {
  if (transporteur) {
    return transporteur;
  }

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporteur = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    return transporteur;
  }

  transporteur = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    newline: 'unix',
  });
  return transporteur;
}

export function peutEnvoyerDesMails(): boolean {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

export function obtenirDestinataireContact(): string {
  return CONTACT_RECIPIENT_EMAIL;
}

export function obtenirDestinataireNewsletter(): string {
  return NEWSLETTER_RECIPIENT_EMAIL;
}

export async function envoyerMail(options: SendMailOptions) {
  const transport = obtenirTransporteur();
  const info = await transport.sendMail({
    from: options.from || obtenirAdresseExpediteur(),
    ...options,
  });

  if (!peutEnvoyerDesMails()) {
    console.info(`Email simulé localement: ${options.subject}`);
  }

  return info;
}

export function creerSujetNotificationContact(nom: string, sujet: string): string {
  return `Nouveau message de contact - ${nom} - ${sujet}`;
}

export function creerSujetAccuseContact(): string {
  return "Nous avons bien reçu votre message";
}

export function creerSujetNewsletterConfirmation(): string {
  return "Inscription à la newsletter Bonne Semence";
}

export function creerSujetNewsletterNotification(): string {
  return "Nouvelle inscription à la newsletter";
}

