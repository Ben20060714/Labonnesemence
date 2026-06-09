/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Url } from "url";

export interface Sermon {
  identifiant: string;
  titre: string;
  orateur: string;
  date: string;
  passageBiblique: string;
  categorie: 'Dimanche' | 'Enseignement' | 'Fête' | 'Dévotion';
  resume: string;
  audioEstJoue?: boolean;
  urlAudio: string;
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
  // email : string;
  biographie: string;
  initiales: string;
}

export interface DevEquipe {
  identifiant : string;
  initiales : string;
  nom : string;
  role : string;
  telephone : string;
  email : string;
  description : string;
  accomplissement : string;
}

export interface MessageContact {
  nom: string;
  email: string;
  sujet: string;
  contenu: string;
}
