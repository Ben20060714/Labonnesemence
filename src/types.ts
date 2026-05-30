/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Sermon {
  identifiant: string;
  titre: string;
  orateur: string;
  date: string;
  passageBiblique: string;
  duree: string;
  categorie: 'Dimanche' | 'Enseignement' | 'Fête';
  resume: string;
  audioEstJoue?: boolean;
}

export interface Evenement {
  identifiant: string;
  titre: string;
  description: string;
  date: string;
  heure: string;
  lieu: string;
  categorie: 'Culte' | 'Jeunesse' | 'Prière' | 'Social';
  placesDisponibles?: number;
}

export interface MembreEquipe {
  identifiant: string;
  nom: string;
  role: string;
  biographie: string;
  initiales: string;
}

export interface MessageContact {
  nom: string;
  email: string;
  sujet: string;
  contenu: string;
}
