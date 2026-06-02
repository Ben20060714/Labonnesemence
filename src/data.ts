/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sermon, Evenement, MembreEquipe, DevEquipe } from './types';

export const SERMONS_DONNEES: Sermon[] = [
  {
    identifiant: 'sermon-1',
    titre: 'La Puissance du Pardon Réciproque',
    orateur: 'Pst. Djoe Baruani',
    date: '24 Mai 2026',
    passageBiblique: 'Matthieu 18:21-22',
    categorie: 'Dimanche',
    resume: 'Comment libérer nos cœurs des fardeaux de l’amertume et restaurer des relations brisées grâce à la grâce divine au quotidien.',
    // urlAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    urlAudio: '../../audio/Killorbeezbeatz - Ameni Ameni - Killorbeezbeatz.mp3'
  },
  {
    identifiant: 'sermon-2',
    titre: 'Marcher avec Confiance au milieu des Tempêtes',
    orateur: 'Diacre Michel Mwamba',
    date: '17 Mai 2026',
    passageBiblique: 'Marc 4:35-41',
    categorie: 'Enseignement',
    resume: 'Une réflexion profonde sur la foi éprouvée dans les moments d’incertitude et la paix intérieure qui découle de la présence du Christ.',
    // urlAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    urlAudio: '../../audio/Killorbeezbeatz - Ameni Ameni - Killorbeezbeatz.mp3'
  },
  {
    identifiant: 'sermon-3',
    titre: 'L’Amour Pratique : Servir son Prochain dans la Cité',
    orateur: 'Pst. Jean-Marc Kalambay',
    date: '10 Mai 2026',
    passageBiblique: 'Luc 10:25-37',
    categorie: 'Dimanche',
    resume: 'Exploration de la parabole du Bon Samaritain et des applications concrètes pour notre engagement bénévole et solidaire actuel.',
    // urlAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    urlAudio: '../../audio/Killorbeezbeatz - Ameni Ameni - Killorbeezbeatz.mp3'
  },
  {
    identifiant: 'sermon-4',
    titre: 'Cultiver la Joie Intérieure au Quotidien',
    orateur: 'Sr. Élise',
    date: '03 Mai 2026',
    passageBiblique: 'Philippiens 4:4-7',
    categorie: 'Enseignement',
    resume: 'Donner de la vie à votre marige.',
    urlAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    identifiant: 'sermon-5',
    titre: 'L’Unité : Un Seul Corps, Plusieurs Membres',
    orateur: 'Pst. Jean-Marc Kalambay',
    date: '26 Avril 2026',
    passageBiblique: '1 Corinthiens 12:12-27',
    categorie: 'Fête',
    resume: 'Célébration de la diversité de commités et présentation des moniteurs de l’école de Dimanche (ECODIM).',
    urlAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  }
];

export const EVENEMENTS_DONNEES: Evenement[] = [
  {
    identifiant: 'evenement-1',
    titre: 'Culte de la Pentecôte',
    description: 'Louanges et adoration suivies d’une détente.',
    date: 'Dimanche 31 Mai 2026',
    heure: '10h30',
    lieu: 'La bonne semence',
    categorie: 'Culte',
    placesDisponibles: 150
  },
  {
    identifiant: 'evenement-2',
    titre: 'Atelier d’Étude Biblique et de Partage',
    description: 'Une soirée d’échange informel autour des Évangiles, ouverte à tous, débutants comme initiés.',
    date: 'Mardi 02 Juin 2026',
    heure: '19h30',
    lieu: 'Salle Saint-Augustin',
    categorie: 'Jeunesse',
    placesDisponibles: 30
  },
  {
    identifiant: 'evenement-3',
    titre: 'Journée de charité pour les Démunis',
    description: 'Préparation et distribution d’un repas chaud aux personnes seules ou en situation précaire de notre quartier.',
    date: 'Samedi 06 Juin 2026',
    heure: '11h00',
    lieu: 'Foyer Communautaire',
    categorie: 'Social',
    placesDisponibles: 45
  },
  {
    identifiant: 'evenement-4',
    titre: 'Veillée de Prière Taizé et Méditation',
    description: 'Rassemblement contemplatif alternant chants répétitifs calmes, lectures saintes et longs moments de silence.',
    date: 'Vendredi 12 Juin 2026',
    heure: '20h30',
    lieu: 'Chapelle de la Trinité',
    categorie: 'Prière',
    placesDisponibles: 80
  },
  {
    identifiant: 'evenement-5',
    titre: 'Répétition de la Chorale gabrielle',
    description: 'Nouvelles voix bienvenues pour préparer le seminaire du 25 Décembre.',
    date: 'Jeudi 04 Juin 2026',
    heure: '18h30',
    lieu: 'Tribune des Orgues',
    categorie: 'Jeunesse',
    placesDisponibles: 25
  }
];
export const DEVELOPPEUR: DevEquipe[] = [
  {
    identifiant : 'Dev-1',
    nom : 'Benjamin Mwaku',
    role : 'Developpeur',
    telephone : '+243 82 043 3981',
    email : 'Benkailazad8@gmail.com',
    description : 'Je suis dévéloppeur web FrontEnd aussi passioné par la sécurité informatique. je suis toujours prêt à apprendre des nouvelles technologies surtout que je m’y adapte facilement, j’utilise des FrameWork comme "Tailwindcss", "TypeScript", "React", des langages comme "HTML", "CSS", "Python".'
  },
  {
    identifiant : 'Dev-2',
    nom : 'Djeef Bulabula',
    role : 'Developpeur',
    telephone : '+243 83 888 983',
    email : 'Djeefjason@gmail.com',
    description : 'Je suis disponible pour apprendre avec vous !.'
  }
]
export const EQUIPE_DONNEES: MembreEquipe[] = [
  {
    identifiant: 'membre-1',
    nom: 'Djoe Baruani',
    role: 'Pasteur de l\'église',
    biographie: 'Lorem ipsum dolor sit amet adipiscing elit quam commodo lak um guit : era tresa endei neti wallit.',
    initiales: 'DB'
  },
  {
    identifiant: 'membre-2',
    nom: 'Jean lukanga',
    role: 'Diacre',
    biographie: 'Lorem ipsum dolor sit amet adipiscing elit quam commodo lak um guit : era tresa endei neti wallit.',
    initiales: 'JL'
  },
  {
    identifiant: 'membre-3',
    nom: 'Sarah Élise',
    role: 'Animatrice',
    biographie: 'Lorem ipsum dolor sit amet adipiscing elit quam commodo lak um guit : era tresa endei neti wallit.',
    initiales: 'SE'
  },
  {
    identifiant: 'membre-4',
    nom: 'Marie Muzanga',
    role: 'Dirigeante de la chorale',
    biographie: 'Lorem ipsum dolor sit amet adipiscing elit quam commodo lak um guit : era tresa endei neti wallit.',
    initiales: 'MM'
  }
];
