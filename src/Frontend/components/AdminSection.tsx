/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Mic,
  Image as ImageIcon,
  Users,
  Plus,
  Trash2,
  Save,
  Clock,
  MapPin,
  BookOpen,
  User,
  Mail,
  Phone,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SERMONS_DONNEES, EVENEMENTS_DONNEES, EQUIPE_DONNEES } from '../data';
import { Sermon, Evenement, MembreEquipe } from '../types';
import { api, FichierBackend, obtenirUrlFichier } from '../services/api';

type SectionAdmin = 'dashboard' | 'evenements' | 'sermons' | 'membres' | 'galerie';
type FormulaireEvenement = Omit<Evenement, 'identifiant' | 'date'>;
type FormulaireSermon = Omit<Sermon, 'identifiant'>;
type FormulaireMembre = Omit<MembreEquipe, 'identifiant'>;

const NOMS_MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", " Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const JOURS_SEMAINE = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function AdminSection() {
  const [sectionActive, definirSectionActive] = useState<SectionAdmin>('dashboard');

  // États pour la gestion des données (Simulé - Normalement lié à une API/Base de données)
  const [evenements, definirEvenements] = useState<Evenement[]>(EVENEMENTS_DONNEES);
  const [sermons, definirSermons] = useState<Sermon[]>(SERMONS_DONNEES);
  const [membres, definirMembres] = useState<MembreEquipe[]>(EQUIPE_DONNEES);
  const [fichiers, definirFichiers] = useState<FichierBackend[]>([]);
  const [notif, definirNotif] = useState<string | null>(null);
  const [fichierGalerie, definirFichierGalerie] = useState<File | null>(null);
  const [fichierAudioSermon, definirFichierAudioSermon] = useState<File | null>(null);
  const [legendeGalerie, definirLegendeGalerie] = useState('');
  const [legendesGalerie, definirLegendesGalerie] = useState<Record<string, string>>({});

  // États pour les formulaires (Exemple de correction pour inputs non contrôlés)
  const [nouveauEvt, definirNouveauEvt] = useState<FormulaireEvenement>({ titre: '', heure: '', lieu: '', description: '', categorie: 'Culte', placesDisponibles: 0 });
  const [nouveauSermon, definirNouveauSermon] = useState<FormulaireSermon>({ titre: '', orateur: '', passageBiblique: '', urlAudio: '', resume: '', date: '', categorie: 'Dimanche' });
  const [nouveauMembre, definirNouveauMembre] = useState<FormulaireMembre>({ nom: '', role: '', initiales: '', biographie: '', email: '', telephone: '' });

  // --- Logique du Calendrier Interactif ---
  const [vueCalendrier, definirVueCalendrier] = useState(new Date());
  const [dateSelectionnee, definirDateSelectionnee] = useState<string>("");

  useEffect(() => {
    let composantActif = true;

    api.listerEvenements()
      .then((donnees) => {
        if (composantActif && donnees.length > 0) definirEvenements(donnees);
      })
      .catch((erreur) => console.error('Chargement admin événements impossible:', erreur));

    api.listerSermons()
      .then((donnees) => {
        if (composantActif && donnees.length > 0) definirSermons(donnees);
      })
      .catch((erreur) => console.error('Chargement admin sermons impossible:', erreur));

    api.listerMembres()
      .then((donnees) => {
        if (composantActif && donnees.length > 0) definirMembres(donnees);
      })
      .catch((erreur) => console.error('Chargement admin membres impossible:', erreur));

    api.listerFichiers()
      .then((donnees) => {
        if (composantActif) definirFichiers(donnees);
      })
      .catch((erreur) => console.error('Chargement admin fichiers impossible:', erreur));

    return () => {
      composantActif = false;
    };
  }, []);

  const genererJoursMois = () => {
    const annee = vueCalendrier.getFullYear();
    const mois = vueCalendrier.getMonth();
    const premierJour = new Date(annee, mois, 1).getDay();
    const totalJours = new Date(annee, mois + 1, 0).getDate();

    const jours = [];
    for (let i = 0; i < premierJour; i++) jours.push(null);
    for (let i = 1; i <= totalJours; i++) jours.push(i);
    return jours;
  };

  const changerMois = (decalage: number) => {
    const nouvelleDate = new Date(vueCalendrier);
    nouvelleDate.setMonth(vueCalendrier.getMonth() + decalage);
    definirVueCalendrier(nouvelleDate);
  };

  // --- Gestion des notifications ---
  const afficherNotification = (msg: string) => {
    definirNotif(msg);
    setTimeout(() => definirNotif(null), 3000);
  };

  // --- Logique d'ajout d'éléments ---
  const ajouterEvenement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauEvt.titre || !dateSelectionnee || !nouveauEvt.heure || !nouveauEvt.lieu) {
      afficherNotification("Veuillez remplir tous les champs obligatoires de l'événement.");
      return;
    }
    try {
      const nouvelEvenement = await api.creerEvenement({
        date: dateSelectionnee,
        ...nouveauEvt,
        placesDisponibles: Number(nouveauEvt.placesDisponibles)
      });
      definirEvenements(prev => [...prev, nouvelEvenement]);
      definirNouveauEvt({ titre: '', heure: '', lieu: '', description: '', categorie: 'Culte', placesDisponibles: 0 });
      definirDateSelectionnee('');
      afficherNotification("Événement ajouté avec succès !");
    } catch (erreur) {
      afficherNotification(erreur instanceof Error ? erreur.message : "Impossible d'ajouter l'événement.");
    }
  };

  const ajouterSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauSermon.titre || !nouveauSermon.orateur || (!nouveauSermon.urlAudio && !fichierAudioSermon)) {
      afficherNotification("Veuillez remplir tous les champs obligatoires du sermon.");
      return;
    }
    try {
      let urlAudio = nouveauSermon.urlAudio;

      if (fichierAudioSermon) {
        const fichierTeleverse = await api.envoyerFichier(fichierAudioSermon);
        urlAudio = obtenirUrlFichier(fichierTeleverse.id);
      }

      const nouveau = await api.creerSermon({
        ...nouveauSermon,
        urlAudio,
      });
      definirSermons(prev => [...prev, nouveau]);
      definirNouveauSermon({ titre: '', orateur: '', passageBiblique: '', urlAudio: '', resume: '', date: '', categorie: 'Dimanche' });
      definirFichierAudioSermon(null);
      afficherNotification("Sermon publié avec succès !");
    } catch (erreur) {
      afficherNotification(erreur instanceof Error ? erreur.message : "Impossible de publier le sermon.");
    }
  };

  const ajouterMembre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauMembre.nom || !nouveauMembre.role || !nouveauMembre.initiales) {
      afficherNotification("Veuillez remplir au moins le nom, le rôle et les initiales du membre.");
      return;
    }
    try {
      const nouveau = await api.creerMembre(nouveauMembre);
      definirMembres(prev => [...prev, nouveau]);
      definirNouveauMembre({ nom: '', role: '', initiales: '', biographie: '', email: '', telephone: '' });
      afficherNotification("Membre ajouté à l'équipe !");
    } catch (erreur) {
      afficherNotification(erreur instanceof Error ? erreur.message : "Impossible d'ajouter le membre.");
    }
  };

  // --- Gestion de la suppression ---
  const supprimerItem = async (type: SectionAdmin, id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;

    try {
      if (type === 'evenements') {
        await api.supprimerEvenement(id);
        definirEvenements(prev => prev.filter(e => e.identifiant !== id));
      }
      if (type === 'sermons') {
        await api.supprimerSermon(id);
        definirSermons(prev => prev.filter(s => s.identifiant !== id));
      }
      if (type === 'membres') {
        await api.supprimerMembre(id);
        definirMembres(prev => prev.filter(m => m.identifiant !== id));
      }
      if (type === 'galerie') {
        await api.supprimerFichier(id);
        definirFichiers(prev => prev.filter(f => f.id !== id));
      }
      afficherNotification("Suppression effectuée avec succès.");
    } catch (erreur) {
      afficherNotification(erreur instanceof Error ? erreur.message : "Suppression impossible.");
    }
  };

  const envoyerPhotoGalerie = async () => {
    if (!fichierGalerie) {
      afficherNotification("Veuillez choisir une image à envoyer.");
      return;
    }

    try {
      const fichier = await api.envoyerFichier(fichierGalerie);
      definirFichiers(prev => [fichier, ...prev]);
      definirFichierGalerie(null);
      if (legendeGalerie.trim()) {
        definirLegendesGalerie(prev => ({
          ...prev,
          [fichier.id]: legendeGalerie.trim(),
        }));
      }
      definirLegendeGalerie('');
      afficherNotification("Photo ajoutée à la galerie.");
    } catch (erreur) {
      afficherNotification(erreur instanceof Error ? erreur.message : "Upload impossible.");
    }
  };

  return (
    <section id="admin-panel-screen" className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar de navigation Admin */}
        <div className="w-full md:w-64 space-y-2">
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 px-4">Administration</h1>

          {[
            { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
            { id: 'evenements', label: 'Événements', icon: CalendarIcon },
            { id: 'sermons', label: 'Enseignements', icon: Mic },
            { id: 'membres', label: 'Membres', icon: Users },
            { id: 'galerie', label: 'Galerie Photos', icon: ImageIcon },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => definirSectionActive(item.id as SectionAdmin)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${sectionActive === item.id
                  ? "bg-[#af894d] text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Zone de contenu principale */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-[#f4ebd9] dark:border-slate-800 p-6 shadow-sm min-h-[600px]">

          <AnimatePresence mode="wait">

            {/* 1. DASHBOARD */}
            {sectionActive === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-6 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                    <span className="text-xs font-mono text-amber-600 uppercase tracking-widest">Événements</span>
                    <p className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">{evenements.length}</p>
                  </div>
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                    <span className="text-xs font-mono text-emerald-600 uppercase tracking-widest">Sermons</span>
                    <p className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">{sermons.length}</p>
                  </div>
                  <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <span className="text-xs font-mono text-blue-600 uppercase tracking-widest">Membres</span>
                    <p className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">{membres.length}</p>
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl space-y-4">
                  <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#af894d]" />
                    A modifier plus tard quand je vais me rassasier
                  </h3>
                  <p className="text-sm  text-slate-600 dark:text-slate-400 leading-relaxed">
                    Pour le moment les modifications apportées ici sontinactives. Une intégration avec un backend (Firebase, Supabase ou Node.js) est peut-être nécessaire.
                  </p>
                </div>
              </motion.div>
            )}

            {/* 2. ÉVÉNEMENTS & CALENDRIER */}
            {sectionActive === 'evenements' && (
              <motion.div key="evts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl font-bold">Organisation des Événements</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Calendrier Interactif */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <span className="font-bold">{NOMS_MOIS[vueCalendrier.getMonth()]} {vueCalendrier.getFullYear()}</span>
                      <div className="flex gap-1">
                        <button onClick={() => changerMois(-1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronLeft className="w-4 h-4" /></button>
                        <button onClick={() => changerMois(1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center bg-slate-100 dark:bg-slate-800 rounded-xl">
                      {JOURS_SEMAINE.map(j => <span key={j} className="text-[10px] font-bold text-slate-400 uppercase py-2">{j}</span>)}
                      {genererJoursMois().map((j, idx) => {
                        const dateStr = j ? `${j} ${NOMS_MOIS[vueCalendrier.getMonth()]} ${vueCalendrier.getFullYear()}` : "";
                        const estSelectionne = dateSelectionnee === dateStr; // Utiliser dateStr comme clé unique
                        return (
                          <button
                            key={dateStr || `empty-${idx}`}
                            disabled={!j}
                            onClick={() => definirDateSelectionnee(dateStr)}
                            className={`h-10 text-xs rounded-lg flex items-center justify-center transition-all ${!j ? "" : estSelectionne ? "bg-[#af894d] text-white font-bold" : "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-700 dark:text-slate-300"
                              }`}
                          >
                            {j}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] italic text-slate-500">Astuce : Sélectionnez un jour pour remplir automatiquement la date du formulaire.</p>
                  </div>

                  {/* Formulaire Ajout Événement */}
                  <form onSubmit={ajouterEvenement} className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#af894d]">Nouvel Événement</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Titre de l'événement"
                        value={nouveauEvt.titre}
                        onChange={e => definirNouveauEvt({ ...nouveauEvt, titre: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <CalendarIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                          <input type="text" placeholder="Date" value={dateSelectionnee} readOnly className="w-full pl-9 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700 bg-slate-100 cursor-not-allowed" />
                        </div>
                        <div className="relative">
                          <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                          <input type="text" placeholder="Heure" value={nouveauEvt.heure} onChange={e => definirNouveauEvt({ ...nouveauEvt, heure: e.target.value })} className="w-full pl-9 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700" />
                        </div>
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Lieu" value={nouveauEvt.lieu} onChange={e => definirNouveauEvt({ ...nouveauEvt, lieu: e.target.value })} className="w-full pl-9 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700" />
                      </div>
                      <div className="relative">
                        <Users className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                        <input type="number" placeholder="Places disponibles" value={nouveauEvt.placesDisponibles} onChange={e => definirNouveauEvt({ ...nouveauEvt, placesDisponibles: Number(e.target.value) })} className="w-full pl-9 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700" />
                      </div>
                      <select value={nouveauEvt.categorie} onChange={e => definirNouveauEvt({ ...nouveauEvt, categorie: e.target.value as Evenement['categorie'] })} className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <option value="Culte">Culte</option>
                        <option value="Jeunesse">Jeunesse</option>
                        <option value="Prière">Prière</option>
                        <option value="Social">Social</option>
                      </select>
                      <textarea placeholder="Description courte..." value={nouveauEvt.description} onChange={e => definirNouveauEvt({ ...nouveauEvt, description: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"></textarea>
                      <button type="submit" className="w-full py-2.5 bg-slate-400 text-white dark:bg-slate-800 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#af894d] transition-all cursor-pointer">
                        Enregistrer
                      </button>
                    </div>
                  </form>
                </div>

                {/* Liste des événements existants */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Événements en cours</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                          <th className="py-3 px-2">Date / Heure</th>
                          <th className="py-3 px-2">Titre</th>
                          <th className="py-3 px-2">Lieu</th>
                          <th className="py-3 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                        {evenements.map(e => (
                          <tr key={e.identifiant} className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                            <td className="py-3 px-2 font-mono text-[11px]">{e.date} • {e.heure}</td>
                            <td className="py-3 px-2 font-semibold">{e.titre}</td>
                            <td className="py-3 px-2 text-slate-500">{e.lieu}</td>
                            <td className="py-3 px-2 text-right">
                              <button onClick={() => supprimerItem('evenements', e.identifiant)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-all cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. ENSEIGNEMENTS (SERMONS) */}
            {sectionActive === 'sermons' && (
              <motion.div key="sermons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <h2 className="font-serif text-xl font-bold">Gestion des Enseignements</h2>

                <form onSubmit={ajouterSermon} className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Titre de la prédication"
                      value={nouveauSermon.titre}
                      onChange={e => definirNouveauSermon({ ...nouveauSermon, titre: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                    />
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Orateur / Prédicateur"
                        value={nouveauSermon.orateur}
                        onChange={e => definirNouveauSermon({ ...nouveauSermon, orateur: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                    </div>
                    <div className="relative">
                      <BookOpen className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Passage biblique"
                        value={nouveauSermon.passageBiblique}
                        onChange={e => definirNouveauSermon({ ...nouveauSermon, passageBiblique: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/40 p-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Fichier audio
                      </label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={e => definirFichierAudioSermon(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                      <p className="text-[10px] text-slate-500">
                        Sélectionnez un fichier audio depuis votre ordinateur. L’URL sera générée automatiquement après l’envoi.
                      </p>
                      {fichierAudioSermon && (
                        <p className="text-[10px] font-mono text-[#af894d] truncate">
                          Sélectionné : {fichierAudioSermon.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3 flex flex-col">
                    <input
                      type="text"
                      placeholder="Date (ex: 24 Mai 2026)"
                      value={nouveauSermon.date}
                      onChange={e => definirNouveauSermon({ ...nouveauSermon, date: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                    />
                    <select value={nouveauSermon.categorie} onChange={e => definirNouveauSermon({ ...nouveauSermon, categorie: e.target.value as Sermon['categorie'] })} className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                      <option value="Dimanche">Dimanche</option><option value="Enseignement">Enseignement</option><option value="Fête">Fête</option></select>
                    <textarea
                      placeholder="Résumé de l'enseignement..."
                      value={nouveauSermon.resume}
                      onChange={e => definirNouveauSermon({ ...nouveauSermon, resume: e.target.value })}
                      className="flex-1 w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700" rows={4}></textarea>
                    <button type="submit" className="w-full py-2.5 bg-slate-400 text-white dark:bg-slate-800 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#af894d] transition-all cursor-pointer flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> Publier
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Archives Audio</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {sermons.map(s => (
                      <div key={s.identifiant} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between group hover:border-[#af894d] transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-[#af894d] rounded-lg"><Mic className="w-5 h-5" /></div>
                          <div>
                            <h4 className="font-bold text-sm">{s.titre}</h4>
                            <p className="text-xs text-slate-500 font-mono">{s.orateur} • {s.date}</p>
                          </div>
                        </div>
                        <button onClick={() => supprimerItem('sermons', s.identifiant)} className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. MEMBRES (TROMBINOSCOPE) */}
            {sectionActive === 'membres' && (
              <motion.div key="membres" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl font-bold">Gestion des membres</h2>
                  <button type="button" onClick={ajouterMembre} className="flex items-center gap-2 px-4 py-2 bg-[#af894d] text-white text-xs font-bold rounded-lg hover:bg-emerald-600 cursor-pointer">
                    <Plus className="w-4 h-4" /> Ajouter un membre
                  </button>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl border border-dashed border-[#e7d4b0] text-center space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3 text-left">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Nom Complet</label>
                      <input
                        type="text"
                        placeholder="Ex: Pasteur Philippe"
                        value={nouveauMembre.nom}
                        onChange={e => definirNouveauMembre({ ...nouveauMembre, nom: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                      <label className="text-[10px] font-bold uppercase text-slate-400">Rôle / Titre</label>
                      <input
                        type="text"
                        placeholder="Ex: Diacre"
                        value={nouveauMembre.role}
                        onChange={e => definirNouveauMembre({ ...nouveauMembre, role: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-3 text-left">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Initiales</label>
                      <input
                        type="text"
                        placeholder="PP"
                        maxLength={2}
                        value={nouveauMembre.initiales}
                        onChange={e => definirNouveauMembre({ ...nouveauMembre, initiales: e.target.value.toUpperCase() })}
                        className="w-20 px-3 py-2 text-sm rounded bg-slate-300 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 uppercase"
                      />
                      <label className="text-[10px] font-bold uppercase text-slate-400">Contact</label>
                      <div className="relative"><Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" /><input
                        type="text"
                        placeholder="Téléphone"
                        value={nouveauMembre.telephone}
                        onChange={e => definirNouveauMembre({ ...nouveauMembre, telephone: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      /></div>
                      <div className="relative"><Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" /><input
                        type="text"
                        placeholder="Email"
                        value={nouveauMembre.email}
                        onChange={e => definirNouveauMembre({ ...nouveauMembre, email: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      /></div>
                    </div>
                    <div className="space-y-3 text-left">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Biographie courte</label>
                      <textarea
                        rows={5}
                        value={nouveauMembre.biographie}
                        onChange={e => definirNouveauMembre({ ...nouveauMembre, biographie: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"></textarea>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button type="submit" onClick={ajouterMembre} className="px-8 py-3 bg-[#af894d] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#936f3c] transition-all cursor-pointer">
                      Ajouter à l'équipe
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {membres.map(m => (
                    <div key={m.identifiant} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-4 relative group">
                      <div className="w-12 h-12 bg-[#af894d] rounded-full flex items-center justify-center text-white font-bold">{m.initiales}</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold">{m.nom}</h4>
                        <p className="text-[11px] text-[#af894d] uppercase font-mono">{m.role}</p>
                      </div>
                      <button onClick={() => supprimerItem('membres', m.identifiant)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 5. GALERIE */}
            {sectionActive === 'galerie' && (
              <motion.div key="galerie" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <h2 className="font-serif text-xl font-bold">Mise à jour de la Galerie</h2>

                <div className="bg-slate-100 dark:bg-slate-800 p-10 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <div className="max-w-xs mx-auto space-y-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <Plus className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Ajouter une photo</p>
                      <p className="text-xs text-slate-500">Les images sont envoyées vers /api/files/upload</p>
                    </div>
                    <div className="pt-2 space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => definirFichierGalerie(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                      <input
                        type="text"
                        value={legendeGalerie}
                        onChange={(e) => definirLegendeGalerie(e.target.value)}
                        placeholder="Légende de l'image"
                        className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={envoyerPhotoGalerie}
                        className="w-full py-2.5 bg-[#af894d] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#936f3c] transition-all cursor-pointer"
                      >
                        Envoyer la photo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fichiers.filter((fichier) => fichier.mimetype.startsWith('image/')).map((fichier) => (
                    <div key={fichier.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden group">
                      <img src={obtenirUrlFichier(fichier.id)} alt={fichier.original_name} className="w-full h-36 object-cover" />
                      <div className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{fichier.original_name}</p>
                          {legendesGalerie[fichier.id] && (
                            <p className="text-[11px] text-slate-500 truncate">{legendesGalerie[fichier.id]}</p>
                          )}
                          <p className="text-[10px] text-slate-500 font-mono">{Math.round(fichier.size / 1024)} Ko</p>
                        </div>
                        <button onClick={() => supprimerItem('galerie', fichier.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {fichiers.filter((fichier) => fichier.mimetype.startsWith('image/')).length === 0 && (
                  <p className="text-xs text-slate-500 text-center italic">Aucune image n'est encore enregistrée en base.</p>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {notif && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[100] bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500/50"
          >
            <div className="bg-[#af894d] rounded-full p-1"><Check className="w-4 h-4" /></div>
            <span className="text-sm font-semibold">{notif}</span>
            <button onClick={() => definirNotif(null)} className="ml-4 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
