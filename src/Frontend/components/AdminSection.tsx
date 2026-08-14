/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, FormEvent } from 'react';
import {
  Calendar as CalendarIcon,
  Mic,
  Volume2,
  Image as ImageIcon,
  CreditCard,
  Users,
  Plus,
  Trash2,
  Save,
  Clock,
  MapPin,
  BookOpen,
  User,
  Mail,
  MessageSquare,
  Phone,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sermon, Evenement, MembreEquipe } from '../types';
import { api, DevotionDuJourBackend, DonationBackend, FichierBackend, MessageContact, obtenirUrlFichier, StatutDonation, calculerInitiales } from '../services/api';

type SectionAdmin = 'dashboard' | 'evenements' | 'sermons' | 'prieres' | 'membres' | 'galerie' | 'messages' | 'dons';
type FormulaireEvenement = Omit<Evenement, 'identifiant' | 'date'>;
type FormulaireSermon = Omit<Sermon, 'identifiant'>;
type FormulaireMembre = Omit<MembreEquipe, 'identifiant'>;
type UsageFichier = 'gallery' | 'cover';
type FormulaireDevotion = Omit<DevotionDuJourBackend, 'id' | 'created_at' | 'updated_at'>;

const NOMS_MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", " Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const JOURS_SEMAINE = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const obtenirDateJourIso = () => new Date().toISOString().slice(0, 10);

const devotionVide = (): FormulaireDevotion => ({
  scheduled_date: obtenirDateJourIso(),
  verse_reference: '',
  verse_text: '',
  meditation_text: '',
  prayer_text: '',
  audio_url: '',
  audio_title: '',
  audio_description: '',
  cover_image_url: '',
  is_published: true,
});

export default function AdminSection() {
  const [sectionActive, definirSectionActive] = useState<SectionAdmin>('dashboard');

  const [evenements, definirEvenements] = useState<Evenement[]>([]);
  const [sermons, definirSermons] = useState<Sermon[]>([]);
  const [membres, definirMembres] = useState<MembreEquipe[]>([]);
  const [fichiers, definirFichiers] = useState<FichierBackend[]>([]);
  const [messagesContact, definirMessagesContact] = useState<MessageContact[]>([]);
  const [donations, definirDonations] = useState<DonationBackend[]>([]);
  const [devotions, definirDevotions] = useState<DevotionDuJourBackend[]>([]);
  const [devotionSelectionneeId, definirDevotionSelectionneeId] = useState<string | null>(null);
  const [formulaireDevotion, definirFormulaireDevotion] = useState<FormulaireDevotion>(() => devotionVide());
  const [notif, definirNotif] = useState<string | null>(null);
  const [fichierGalerie, definirFichierGalerie] = useState<File | null>(null);
  const [fichierImageSermon, definirFichierImageSermon] = useState<File | null>(null);
  const [fichierImageEvenement, definirFichierImageEvenement] = useState<File | null>(null);
  const [fichierImageMembre, definirFichierImageMembre] = useState<File | null>(null);
  const [fichierAudioSermon, definirFichierAudioSermon] = useState<File | null>(null);
  const [fichierExhortationVocale, definirFichierExhortationVocale] = useState<File | null>(null);
  const [fichierImageDevotion, definirFichierImageDevotion] = useState<File | null>(null);
  const [legendeGalerie, definirLegendeGalerie] = useState('');
  const [categorieGalerie, definirCategorieGalerie] = useState('Galerie');
  const [usageGalerie, definirUsageGalerie] = useState<UsageFichier>('gallery');

  // États pour les formulaires (Exemple de correction pour inputs non contrôlés)
  const [nouveauEvt, definirNouveauEvt] = useState<FormulaireEvenement>({ titre: '', heure: '', lieu: '', description: '', categorie: 'Culte', placesDisponibles: 0 });
  const [nouveauSermon, definirNouveauSermon] = useState<FormulaireSermon>({ titre: '', orateur: '', passageBiblique: '', urlAudio: '', resume: '', date: '', categorie: 'Dimanche' });
  const [nouveauMembre, definirNouveauMembre] = useState<FormulaireMembre>({ prenom: '', nom: '', role: '', biographie: '', email: '', telephone: '', afficherCoordonnees: false });

  // --- Logique du Calendrier Interactif ---
  const [vueCalendrier, definirVueCalendrier] = useState(new Date());
  const [dateSelectionnee, definirDateSelectionnee] = useState<string>("");

  useEffect(() => {
    let composantActif = true;

    api.listerEvenements()
      .then((donnees) => {
        if (composantActif) definirEvenements(donnees);
      })
      .catch((erreur) => console.error('Chargement admin événements impossible:', erreur));

    api.listerSermons()
      .then((donnees) => {
        if (composantActif) definirSermons(donnees);
      })
      .catch((erreur) => console.error('Chargement admin enseignements impossible:', erreur));

    api.listerMembres()
      .then((donnees) => {
        if (composantActif) definirMembres(donnees);
      })
      .catch((erreur) => console.error('Chargement admin membres impossible:', erreur));

    api.listerFichiers()
      .then((donnees) => {
        if (composantActif) definirFichiers(donnees);
      })
      .catch((erreur) => console.error('Chargement admin fichiers impossible:', erreur));

    api.listerMessagesContact()
      .then((donnees) => {
        if (composantActif) definirMessagesContact(donnees);
      })
      .catch((erreur) => console.error('Chargement admin messages contact impossible:', erreur));

    api.listerDonations()
      .then((donnees) => {
        if (composantActif) definirDonations(donnees);
      })
      .catch((erreur) => console.error('Chargement admin dons impossible:', erreur));

    api.listerDevotions()
      .then((donnees) => {
        if (!composantActif) return;
        definirDevotions(donnees);
        const devotionDuJour = donnees.find((devotion) => devotion.scheduled_date.slice(0, 10) === obtenirDateJourIso()) || donnees[0];
        if (devotionDuJour) {
          definirDevotionSelectionneeId(devotionDuJour.id);
          definirFormulaireDevotion({
            scheduled_date: devotionDuJour.scheduled_date.slice(0, 10),
            verse_reference: devotionDuJour.verse_reference,
            verse_text: devotionDuJour.verse_text,
            meditation_text: devotionDuJour.meditation_text || '',
            prayer_text: devotionDuJour.prayer_text,
            audio_url: devotionDuJour.audio_url || '',
            audio_title: devotionDuJour.audio_title || '',
            audio_description: devotionDuJour.audio_description || '',
            cover_image_url: devotionDuJour.cover_image_url || '',
            is_published: devotionDuJour.is_published,
          });
        }
      })
      .catch((erreur) => console.error('Chargement admin dévotions impossible:', erreur));

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

  const selectionnerDevotion = (devotion: DevotionDuJourBackend) => {
    definirDevotionSelectionneeId(devotion.id);
    definirFormulaireDevotion({
      scheduled_date: devotion.scheduled_date.slice(0, 10),
      verse_reference: devotion.verse_reference,
      verse_text: devotion.verse_text,
      meditation_text: devotion.meditation_text || '',
      prayer_text: devotion.prayer_text,
      audio_url: devotion.audio_url || '',
      audio_title: devotion.audio_title || '',
      audio_description: devotion.audio_description || '',
      cover_image_url: devotion.cover_image_url || '',
      is_published: devotion.is_published,
    });
    definirFichierExhortationVocale(null);
    definirFichierImageDevotion(null);
  };

  const preparerNouvelleDevotion = () => {
    definirDevotionSelectionneeId(null);
    definirFormulaireDevotion(devotionVide());
    definirFichierExhortationVocale(null);
    definirFichierImageDevotion(null);
  };

  const enregistrerDevotion = async (e: FormEvent) => {
    e.preventDefault();
    if (!formulaireDevotion.scheduled_date || !formulaireDevotion.verse_reference.trim() || !formulaireDevotion.verse_text.trim() || !formulaireDevotion.prayer_text.trim()) {
      afficherNotification("Veuillez renseigner la date, la référence, le verset et la prière.");
      return;
    }

    const fichiersTeleverses: FichierBackend[] = [];

    try {
      let audioUrl = formulaireDevotion.audio_url || '';
      let coverImageUrl = formulaireDevotion.cover_image_url || '';

      if (fichierExhortationVocale) {
        const fichierAudio = await api.envoyerFichier(fichierExhortationVocale, {
          legend: [formulaireDevotion.audio_title, formulaireDevotion.audio_description].filter(Boolean).join(' - '),
          usage: 'gallery',
          categorie: 'Prière du jour - audio',
        });
        fichiersTeleverses.push(fichierAudio);
        audioUrl = obtenirUrlFichier(fichierAudio.id);
      }

      if (fichierImageDevotion) {
        const fichierImage = await api.envoyerFichier(fichierImageDevotion, {
          usage: 'cover',
          categorie: 'Prière du jour',
        });
        fichiersTeleverses.push(fichierImage);
        coverImageUrl = obtenirUrlFichier(fichierImage.id);
      }

      const donnees = {
        ...formulaireDevotion,
        verse_reference: formulaireDevotion.verse_reference.trim(),
        verse_text: formulaireDevotion.verse_text.trim(),
        meditation_text: formulaireDevotion.meditation_text.trim(),
        prayer_text: formulaireDevotion.prayer_text.trim(),
        audio_url: audioUrl.trim(),
        audio_title: (formulaireDevotion.audio_title || '').trim(),
        audio_description: (formulaireDevotion.audio_description || '').trim(),
        cover_image_url: coverImageUrl.trim(),
      };
      const devotion = devotionSelectionneeId
        ? await api.modifierDevotion(devotionSelectionneeId, donnees)
        : await api.creerDevotion(donnees);

      if (fichiersTeleverses.length > 0) {
        definirFichiers(prev => [...fichiersTeleverses, ...prev]);
      }
      definirDevotions(prev => {
        const existe = prev.some(item => item.id === devotion.id);
        const liste = existe ? prev.map(item => item.id === devotion.id ? devotion : item) : [devotion, ...prev];
        return liste.sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date));
      });
      selectionnerDevotion(devotion);
      definirFichierExhortationVocale(null);
      definirFichierImageDevotion(null);
      afficherNotification(devotionSelectionneeId ? "Prière du jour mise à jour." : "Prière du jour publiée.");
    } catch (erreur) {
      await Promise.all(fichiersTeleverses.map((fichier) => api.supprimerFichier(fichier.id).catch(() => undefined)));
      afficherNotification(erreur instanceof Error ? erreur.message : "Impossible d'enregistrer la prière du jour.");
    }
  };

  const supprimerDevotion = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette prière du jour ?")) return;

    try {
      await api.supprimerDevotion(id);
      definirDevotions(prev => prev.filter(devotion => devotion.id !== id));
      if (devotionSelectionneeId === id) {
        preparerNouvelleDevotion();
      }
      afficherNotification("Prière du jour supprimée.");
    } catch (erreur) {
      afficherNotification(erreur instanceof Error ? erreur.message : "Suppression de la prière impossible.");
    }
  };

  const televerserImageEtObtenirUrl = async (
    fichier: File | null,
    usage: UsageFichier = 'gallery',
    categorie?: string
  ): Promise<string | undefined> => {
    if (!fichier) return undefined;
    const televerse = await api.envoyerFichier(fichier, { usage, categorie });
    return obtenirUrlFichier(televerse.id);
  };

  // --- Logique d'ajout d'éléments ---
  const ajouterEvenement = async (e: FormEvent) => {
    e.preventDefault();
    if (!nouveauEvt.titre || !dateSelectionnee || !nouveauEvt.heure || !nouveauEvt.lieu) {
      afficherNotification("Veuillez remplir tous les champs obligatoires de l'événement.");
      return;
    }
    try {
      const imageUrl = await televerserImageEtObtenirUrl(fichierImageEvenement, 'cover');
      const nouvelEvenement = await api.creerEvenement({
        date: dateSelectionnee,
        ...nouveauEvt,
        placesDisponibles: Number(nouveauEvt.placesDisponibles),
        imageUrl,
      });
      definirEvenements(prev => [...prev, nouvelEvenement]);
      definirNouveauEvt({ titre: '', heure: '', lieu: '', description: '', categorie: 'Culte', placesDisponibles: 0 });
      definirDateSelectionnee('');
      definirFichierImageEvenement(null);
      afficherNotification("Événement ajouté avec succès !");
    } catch (erreur) {
      afficherNotification(erreur instanceof Error ? erreur.message : "Impossible d'ajouter l'événement.");
    }
  };

  const ajouterSermon = async (e: FormEvent) => {
    e.preventDefault();
    if (!nouveauSermon.titre || !nouveauSermon.orateur || (!nouveauSermon.urlAudio && !fichierAudioSermon)) {
      afficherNotification("Veuillez remplir tous les champs obligatoires de l'enseignement.");
      return;
    }
    try {
      let urlAudio = nouveauSermon.urlAudio;
      const imageUrl = await televerserImageEtObtenirUrl(fichierImageSermon, 'cover');

      if (fichierAudioSermon) {
        const fichierTeleverse = await api.envoyerFichier(fichierAudioSermon);
        urlAudio = obtenirUrlFichier(fichierTeleverse.id);
      }

      const nouveau = await api.creerSermon({
        ...nouveauSermon,
        urlAudio,
        imageUrl,
      });
      definirSermons(prev => [...prev, nouveau]);
      definirNouveauSermon({ titre: '', orateur: '', passageBiblique: '', urlAudio: '', resume: '', date: '', categorie: 'Dimanche' });
      definirFichierAudioSermon(null);
      definirFichierImageSermon(null);
      afficherNotification("Enseignement publié avec succès !");
    } catch (erreur) {
      afficherNotification(erreur instanceof Error ? erreur.message : "Impossible de publier l'enseignement'.");
    }
  };

  const ajouterMembre = async (e: FormEvent) => {
    e.preventDefault();
    if (!nouveauMembre.prenom || !nouveauMembre.nom || !nouveauMembre.role) {
      afficherNotification("Veuillez remplir au moins le prénom, le nom et le rôle du membre.");
      return;
    }
    try {
      const imageUrl = await televerserImageEtObtenirUrl(fichierImageMembre, 'cover', 'Membre');
      const nouveau = await api.creerMembre({
        ...nouveauMembre,
        imageUrl,
      });
      definirMembres(prev => [...prev, nouveau]);
      definirNouveauMembre({ prenom: '', nom: '', role: '', biographie: '', email: '', telephone: '', afficherCoordonnees: false });
      definirFichierImageMembre(null);
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
      if (type === 'messages') {
        await api.supprimerMessageContact(id);
        definirMessagesContact(prev => prev.filter(message => message.id !== id));
      }
      afficherNotification("Suppression effectuée avec succès.");
    } catch (erreur) {
      afficherNotification(erreur instanceof Error ? erreur.message : "Suppression impossible.");
    }
  };

  const envoyerPhotoGalerie = async () => {
    if (!fichierGalerie) {
      afficherNotification("Veuillez choisir une image à publier.");
      return;
    }

    try {
      const fichier = await api.envoyerFichier(fichierGalerie, {
        legend: legendeGalerie,
        usage: usageGalerie,
        categorie: categorieGalerie,
      });
      definirFichiers(prev => [fichier, ...prev]);
      definirFichierGalerie(null);
      definirLegendeGalerie('');
      definirCategorieGalerie('Galerie');
      definirUsageGalerie('gallery');
      afficherNotification(usageGalerie === 'cover' ? "Image de base ajoutée au site." : "Photo ajoutée à la galerie.");
    } catch (erreur) {
      afficherNotification(erreur instanceof Error ? erreur.message : "Chargement impossible.");
    }
  };

  const changerStatutDonation = async (id: string, status: StatutDonation) => {
    try {
      const donation = await api.mettreAJourStatutDonation(id, status);
      definirDonations(prev => prev.map(item => item.id === id ? donation : item));
      afficherNotification("Statut du don mis à jour.");
    } catch (erreur) {
      afficherNotification(erreur instanceof Error ? erreur.message : "Impossible de mettre à jour le don.");
    }
  };

  const formaterNomCompletMembre = (membre: Pick<MembreEquipe, 'prenom' | 'nom'>) => {
    return [membre.prenom, membre.nom].filter(Boolean).join(' ').trim() || 'Membre';
  };

  const imagesGalerie = fichiers.filter((fichier) => fichier.mimetype.startsWith('image/') && (fichier.usage || 'gallery') === 'gallery');
  const imagesBaseSite = fichiers.filter((fichier) => fichier.mimetype.startsWith('image/') && (fichier.usage || 'gallery') === 'cover');
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
            { id: 'prieres', label: 'Prière du jour', icon: Volume2 },
            { id: 'membres', label: 'Membres', icon: Users },
            { id: 'galerie', label: 'Galerie Photos', icon: ImageIcon },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'dons', label: 'Dons', icon: CreditCard },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => definirSectionActive(item.id as SectionAdmin)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${sectionActive === item.id
                ? "bg-[#af894d] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
            >
              <item.icon className="w-4 h-4"/>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="p-6 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                    <span className="text-xs font-mono text-amber-600 uppercase tracking-widest">Événements</span>
                    <p className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">{evenements.length}</p>
                  </div>
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                    <span className="text-xs font-mono text-emerald-600 uppercase tracking-widest">Enseignements</span>
                    <p className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">{sermons.length}</p>
                  </div>
                  <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <span className="text-xs font-mono text-blue-600 uppercase tracking-widest">Membres</span>
                    <p className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">{membres.length}</p>
                  </div>
                  <div className="p-6 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
                    <span className="text-xs font-mono text-rose-600 uppercase tracking-widest">Messages</span>
                    <p className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">{messagesContact.length}</p>
                  </div>
                  <div className="p-6 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900/30">
                    <span className="text-xs font-mono text-violet-600 uppercase tracking-widest">Dons</span>
                    <p className="text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">{donations.length}</p>
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl space-y-4">
                  <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#af894d]"/>
                    Info pour Administrateur
                  </h3>
                  <p className="text-sm  text-slate-600 dark:text-slate-400 leading-relaxed">
                    Cette page vous donne toutes les autorisations pour l'ajout et suppression d'informations sur ce site. Certaines fonctionnalités sont en cours de développement.
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
                        <button onClick={() => changerMois(-1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronLeft className="w-4 h-4"/></button>
                        <button onClick={() => changerMois(1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronRight className="w-4 h-4"/></button>
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
                    <p className="text-[10px] italic text-red-500"># Sélectionnez un jour pour remplir automatiquement la date du formulaire.</p>
                  </div>

                  {/* Formulaire Ajout Événement */}
                  <form onSubmit={ajouterEvenement} className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#af894d]">Ajouter un nouvel Événement</h3>
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
                          <CalendarIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400"/>
                          <input type="text" placeholder="Date" value={dateSelectionnee} readOnly className="w-full pl-9 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700 bg-slate-100 cursor-not-allowed"/>
                        </div>
                        <div className="relative">
                          <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400"/>
                          <input type="text" placeholder="Heure" value={nouveauEvt.heure} onChange={e => definirNouveauEvt({ ...nouveauEvt, heure: e.target.value })} className="w-full pl-9 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"/>
                        </div>
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400"/>
                        <input type="text" placeholder="Lieu" value={nouveauEvt.lieu} onChange={e => definirNouveauEvt({ ...nouveauEvt, lieu: e.target.value })} className="w-full pl-9 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"/>
                      </div>
                      {/* <div className="relative hidden">
                        <Users className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400"/>
                        <input type="number" placeholder="Places disponibles" value={nouveauEvt.placesDisponibles} onChange={e => definirNouveauEvt({ ...nouveauEvt, placesDisponibles: Number(e.target.value) })} className="w-full pl-9 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"/>
                      </div> */}
                      <div className="space-y-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/40 p-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Image de couverture de l'événement</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => definirFichierImageEvenement(e.target.files?.[0] || null)}
                          className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                        />
                        {fichierImageEvenement && (
                          <p className="text-[10px] font-mono text-[#af894d] truncate">
                            {fichierImageEvenement.name}
                          </p>
                        )}
                      </div>
                      <select value={nouveauEvt.categorie} onChange={e => definirNouveauEvt({ ...nouveauEvt, categorie: e.target.value as Evenement['categorie'] })} className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <option value="Culte">Culte</option>
                        <option value="Jeunesse">Jeunesse</option>
                        <option value="Prière">Prière</option>
                        <option value="Social">Social</option>
                      </select>
                      <textarea placeholder="Description courte..." value={nouveauEvt.description} onChange={e => definirNouveauEvt({ ...nouveauEvt, description: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"></textarea>
                      <button type="submit" className="w-full py-2.5 bg-slate-400 text-white dark:bg-slate-800 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#af894d] transition-all cursor-pointer">
                        Publier
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
                          <th className="py-3 px-2">Visuel</th>
                          <th className="py-3 px-2">Date / Heure</th>
                          <th className="py-3 px-2">Titre</th>
                          <th className="py-3 px-2">Lieu</th>
                          <th className="py-3 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                        {evenements.map(e => (
                          <tr key={e.identifiant} className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                            <td className="py-3 px-2">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                {e.imageUrl ? (
                                  <img src={e.imageUrl} alt={e.titre} className="w-full h-full object-cover"/>
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-slate-400"/>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2 font-mono text-[11px]">{e.date} • {e.heure}</td>
                            <td className="py-3 px-2 font-semibold">{e.titre}</td>
                            <td className="py-3 px-2 text-slate-500">{e.lieu}</td>
                            <td className="py-3 px-2 text-right">
                              <button onClick={() => supprimerItem('evenements', e.identifiant)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-all cursor-pointer">
                                <Trash2 className="w-4 h-4"/>
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

            {/* 3. ENSEIGNEMENTS */}
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
                      <User className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400"/>
                      <input
                        type="text"
                        placeholder="Orateur"
                        value={nouveauSermon.orateur}
                        onChange={e => definirNouveauSermon({ ...nouveauSermon, orateur: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                    </div>
                    <div className="relative">
                      <BookOpen className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400"/>
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
                        Sélectionnez un fichier audio depuis votre appareil.
                      </p>
                      {fichierAudioSermon && (
                        <p className="text-[10px] font-mono text-[#af894d] truncate">
                          {fichierAudioSermon.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/40 p-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Image de couverture
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => definirFichierImageSermon(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                      {fichierImageSermon && (
                        <p className="text-[10px] font-mono text-[#af894d] truncate">
                          {fichierImageSermon.name}
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
                      <Save className="w-4 h-4"/> Publier
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Archives Audio</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {sermons.map(s => (
                      <div key={s.identifiant} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between group hover:border-[#af894d] transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 overflow-hidden rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-[#af894d] shrink-0">
                            {s.imageUrl ? (
                              <img src={s.imageUrl} alt={s.titre} className="w-full h-full object-cover"/>
                            ) : (
                              <Mic className="w-5 h-5"/>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{s.titre}</h4>
                            <p className="text-xs text-slate-500 font-mono">{s.orateur} • {s.date}</p>
                          </div>
                        </div>
                        <button onClick={() => supprimerItem('sermons', s.identifiant)} className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. PRIÈRE DU JOUR */}
            {sectionActive === 'prieres' && (
              <motion.div key="prieres" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="space-y-2">
                  <h2 className="font-serif text-xl font-bold">Prière du jour</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Gérez le verset, la prière et les exhortations vocales affichés dans la section publique.
                  </p>
                </div>

                <form onSubmit={enregistrerDevotion} className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl border border-dashed border-[#e7d4b0] space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      {devotionSelectionneeId ? "Modifier la prière publiée" : "Nouvelle prière du jour"}
                    </h3>
                    <button
                      type="button"
                      onClick={preparerNouvelleDevotion}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md border border-slate-200 text-slate-600 hover:border-[#af894d] hover:text-[#af894d] dark:border-slate-700 dark:text-slate-300"
                    >
                      <Plus className="w-4 h-4" /> Nouvelle
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date de publication</label>
                      <input
                        type="date"
                        value={formulaireDevotion.scheduled_date}
                        onChange={(e) => definirFormulaireDevotion({ ...formulaireDevotion, scheduled_date: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Référence biblique</label>
                      <input
                        type="text"
                        value={formulaireDevotion.verse_reference}
                        onChange={(e) => definirFormulaireDevotion({ ...formulaireDevotion, verse_reference: e.target.value })}
                        placeholder="Ex: Psaume 46 : 2"
                        className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Verset du jour</label>
                    <textarea
                      rows={3}
                      value={formulaireDevotion.verse_text}
                      onChange={(e) => definirFormulaireDevotion({ ...formulaireDevotion, verse_text: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Prière du jour</label>
                    <textarea
                      rows={6}
                      value={formulaireDevotion.prayer_text}
                      onChange={(e) => definirFormulaireDevotion({ ...formulaireDevotion, prayer_text: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Méditation écrite</label>
                    <textarea
                      rows={3}
                      value={formulaireDevotion.meditation_text}
                      onChange={(e) => definirFormulaireDevotion({ ...formulaireDevotion, meditation_text: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>

                  <div className="rounded-lg border border-dashed border-slate-300 bg-white/50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                    <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Exhortation vocale</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Titre de l'exhortation</label>
                        <input
                          type="text"
                          value={formulaireDevotion.audio_title || ''}
                          onChange={(e) => definirFormulaireDevotion({ ...formulaireDevotion, audio_title: e.target.value })}
                          placeholder="Titre de l'exhortation"
                          className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description courte</label>
                        <input
                          type="text"
                          value={formulaireDevotion.audio_description || ''}
                          onChange={(e) => definirFormulaireDevotion({ ...formulaireDevotion, audio_description: e.target.value })}
                          placeholder="Description courte"
                          className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fichier audio</label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => definirFichierExhortationVocale(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                      {(fichierExhortationVocale || formulaireDevotion.audio_url) && (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-[10px] font-mono text-[#af894d] truncate">
                            {fichierExhortationVocale ? fichierExhortationVocale.name : 'Audio déjà enregistré'}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              definirFichierExhortationVocale(null);
                              definirFormulaireDevotion({
                                ...formulaireDevotion,
                                audio_url: '',
                                audio_title: '',
                                audio_description: '',
                              });
                            }}
                            className="inline-flex items-center justify-center gap-2 self-start px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30"
                          >
                            <X className="w-3 h-3" /> Retirer l'audio
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-dashed border-slate-300 bg-white/50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                    <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Image de couverture</h4>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => definirFichierImageDevotion(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                    />
                    {(fichierImageDevotion || formulaireDevotion.cover_image_url) && (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[10px] font-mono text-[#af894d] truncate">
                          {fichierImageDevotion ? fichierImageDevotion.name : 'Image déjà enregistrée'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            definirFichierImageDevotion(null);
                            definirFormulaireDevotion({ ...formulaireDevotion, cover_image_url: '' });
                          }}
                          className="inline-flex items-center justify-center gap-2 self-start px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30"
                        >
                          <X className="w-3 h-3" /> Retirer l'image
                        </button>
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formulaireDevotion.is_published}
                      onChange={(e) => definirFormulaireDevotion({ ...formulaireDevotion, is_published: e.target.checked })}
                    />
                    Publier dans la section publique
                  </label>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#af894d] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#936f3c] transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" /> Enregistrer la prière
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Prières programmées</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {devotions.map((devotion) => (
                      <div key={devotion.id} className={`p-4 bg-white dark:bg-slate-900 border rounded-xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all ${devotionSelectionneeId === devotion.id ? 'border-[#af894d]' : 'border-slate-100 dark:border-slate-800'}`}>
                        <button
                          type="button"
                          onClick={() => selectionnerDevotion(devotion)}
                          className="flex flex-1 items-start gap-4 text-left min-w-0"
                        >
                          <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-[#af894d] shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-sm">{devotion.verse_reference}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${devotion.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {devotion.is_published ? 'Publié' : 'Brouillon'}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 font-mono">{devotion.scheduled_date.slice(0, 10)}</p>
                            <p className="mt-2 text-xs text-slate-500 line-clamp-2">{devotion.verse_text}</p>
                          </div>
                        </button>
                        <button onClick={() => supprimerDevotion(devotion.id)} className="self-end p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer sm:self-center">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    ))}
                  </div>
                  {devotions.length === 0 && (
                    <p className="text-xs text-slate-500 text-center italic">Aucune prière du jour n'est encore programmée.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* 4. MEMBRES (TROMBINOSCOPE) */}
            {sectionActive === 'membres' && (
              <motion.div key="membres" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold">Gestion de la hiérarchie</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ces fiches sont publiques et ne créent aucun compte utilisateur.</p>
                  </div>
                </div>

                <form onSubmit={ajouterMembre} className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl border border-dashed border-[#e7d4b0] text-center space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3 text-left">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Prénom</label>
                      <input
                        type="text"
                        placeholder="Ex: Philippe"
                        value={nouveauMembre.prenom}
                        onChange={e => definirNouveauMembre({ ...nouveauMembre, prenom: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                      <label className="text-[10px] font-bold uppercase text-slate-400">Nom</label>
                      <input
                        type="text"
                        placeholder="Ex: Kalonda"
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
                      <label className="text-[10px] font-bold uppercase text-slate-400">Contact</label>
                      <div className="relative"><Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400"/><input
                        type="text"
                        placeholder="Téléphone"
                        value={nouveauMembre.telephone}
                        onChange={e => definirNouveauMembre({ ...nouveauMembre, telephone: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      /></div>
                      <div className="relative"><Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400"/><input
                        type="email"
                        placeholder="Email"
                        value={nouveauMembre.email}
                        onChange={e => definirNouveauMembre({ ...nouveauMembre, email: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      /></div>
                      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={nouveauMembre.afficherCoordonnees}
                          onChange={e => definirNouveauMembre({ ...nouveauMembre, afficherCoordonnees: e.target.checked })}
                        />
                        Afficher les coordonnées dans la fiche publique
                      </label>
                    </div>
                    <div className="space-y-3 text-left">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Biographie courte</label>
                      <textarea
                        rows={5}
                        value={nouveauMembre.biographie}
                        onChange={e => definirNouveauMembre({ ...nouveauMembre, biographie: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"></textarea>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Photo de profil</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => definirFichierImageMembre(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 text-sm rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      />
                      {fichierImageMembre && (
                        <p className="text-[10px] font-mono text-[#af894d] truncate">
                          Sélectionnée : {fichierImageMembre.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="px-8 py-3 bg-[#af894d] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#936f3c] transition-all cursor-pointer">
                      Ajouter à l'équipe
                    </button>
                  </div>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {membres.map(m => (
                    <div key={m.identifiant} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-4 relative group">
                      <div className="w-12 h-12 bg-[#af894d] rounded-full flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
                        {m.imageUrl ? (
                          <img src={m.imageUrl} alt={formaterNomCompletMembre(m)} className="w-full h-full object-cover"/>
                        ) : (
                          calculerInitiales(m.prenom, m.nom)
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold">{formaterNomCompletMembre(m)}</h4>
                        <p className="text-[11px] text-[#af894d] uppercase font-mono">{m.role}</p>
                        <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                          {m.biographie}
                        </p>
                      </div>
                      <button onClick={() => supprimerItem('membres', m.identifiant)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 5. MESSAGES DE CONTACT */}
            {sectionActive === 'messages' && (
              <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl font-bold">Messages reçus</h2>
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400">{messagesContact.length} message(s)</span>
                </div>

                <div className="space-y-4">
                  {messagesContact.map((message) => (
                    <div key={message.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">{message.sujet}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> {message.nom}</span>
                            <a href={`mailto:${message.email}`} className="flex items-center gap-1.5 text-[#af894d] hover:underline">
                              <Mail className="w-3.5 h-3.5"/> {message.email}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                            {new Date(message.created_at).toLocaleString('fr-FR')}
                          </span>
                          <button onClick={() => supprimerItem('messages', message.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all cursor-pointer">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{message.contenu}</p>
                    </div>
                  ))}
                </div>

                {messagesContact.length === 0 && (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-10 text-center space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-slate-400"/>
                    <p className="text-sm text-slate-500">Aucun message de contact enregistré pour le moment.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* 6. DONS */}
            {sectionActive === 'dons' && (
              <motion.div key="dons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl font-bold">Suivi des dons</h2>
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                    {donations.reduce((total, don) => total + (don.status === 'paid' ? don.amount : 0), 0)} $ confirmés
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                        <th className="py-3 px-2">Donateur</th>
                        <th className="py-3 px-2">Montant</th>
                        <th className="py-3 px-2">Référence</th>
                        <th className="py-3 px-2">Statut</th>
                        <th className="py-3 px-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                      {donations.map((donation) => (
                        <tr key={donation.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-2">
                            <div className="font-semibold">{donation.donor_name}</div>
                            <div className="text-[11px] text-slate-500">{donation.donor_email} • {donation.donor_phone}</div>
                          </td>
                          <td className="py-3 px-2 font-serif font-bold">{donation.amount} {donation.currency}</td>
                          <td className="py-3 px-2 font-mono text-[11px]">{donation.reference}</td>
                          <td className="py-3 px-2">
                            <select
                              value={donation.status}
                              onChange={(e) => changerStatutDonation(donation.id, e.target.value as StatutDonation)}
                              className={`px-2 py-1 rounded text-[11px] font-bold uppercase border ${donation.status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : donation.status === 'failed'
                                    ? 'bg-rose-50 text-rose-700 border-rose-100'
                                    : donation.status === 'cancelled'
                                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}
                            >
                              <option value="pending">En attente</option>
                              <option value="paid">Payé</option>
                              <option value="failed">Échoué</option>
                              <option value="cancelled">Annulé</option>
                            </select>
                          </td>
                          <td className="py-3 px-2 text-[11px] text-slate-500">{new Date(donation.created_at).toLocaleString('fr-FR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {donations.length === 0 && (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-10 text-center space-y-2">
                    <CreditCard className="w-8 h-8 mx-auto text-slate-400"/>
                    <p className="text-sm text-slate-500">Aucun don enregistré pour le moment.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* 5. GALERIE */}
            {sectionActive === 'galerie' && (
              <motion.div key="galerie" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="space-y-2">
                  <h2 className="font-serif text-xl font-bold">Mise à jour de la Galerie</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Les images de base du site et les photos de la galerie sont gérées ici.
                  </p>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 p-10 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <div className="max-w-xs mx-auto space-y-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <Plus className="w-8 h-8"/>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Ajouter une photo</p>
                      <p className="text-xs text-slate-500">Choisissez la catégorie et si l'image sert à la galerie ou au site</p>
                    </div>
                    <div className="pt-2 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                          value={usageGalerie}
                          onChange={(e) => definirUsageGalerie(e.target.value as UsageFichier)}
                          className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                        >
                          <option value="gallery">Galerie du site</option>
                          <option value="cover">Image de base du site</option>
                        </select>
                        <input
                          type="text"
                          value={categorieGalerie}
                          onChange={(e) => definirCategorieGalerie(e.target.value)}
                          placeholder="Catégorie, ex: Hero accueil"
                          className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                        />
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => definirFichierGalerie(e.target.files?.[0] || null)} className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"/>
                      <input type="text" value={legendeGalerie} onChange={(e) => definirLegendeGalerie(e.target.value)} placeholder="Légende de l'image" className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-700"/>
                      <button type="button" onClick={envoyerPhotoGalerie} className="w-full py-2.5 bg-[#af894d] text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#936f3c] transition-all cursor-pointer">
                        Envoyer la photo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#af894d]">Images de la galerie</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {imagesGalerie.map((fichier) => (
                        <div key={fichier.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden group">
                          <img
                            src={obtenirUrlFichier(fichier.id)}
                            alt={fichier.legend || fichier.original_name}
                            className="w-full h-36 object-cover"
                          />
                          <div className="p-4 flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                              <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-50 text-[#af894d] text-[10px] font-bold uppercase tracking-widest dark:bg-amber-950/30 dark:text-amber-400">
                                {fichier.categorie?.trim() || 'Galerie'}
                              </span>
                              <p className="text-sm font-semibold truncate">
                                {fichier.legend?.trim() || fichier.original_name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">{Math.round(fichier.size / 1024)} Ko</p>
                            </div>
                            <button onClick={() => supprimerItem('galerie', fichier.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {imagesGalerie.length === 0 && (
                      <p className="text-xs text-slate-500 text-center italic">Aucune image de galerie n'est encore enregistrée.</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#af894d]">Images de base du site</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {imagesBaseSite.map((fichier) => (
                        <div key={fichier.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden group">
                          <img
                            src={obtenirUrlFichier(fichier.id)}
                            alt={fichier.legend || fichier.original_name}
                            className="w-full h-36 object-cover"
                          />
                          <div className="p-4 flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                              <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest dark:bg-slate-800 dark:text-slate-300">
                                {fichier.categorie?.trim() || 'Image de base'}
                              </span>
                              <p className="text-sm font-semibold truncate">
                                {fichier.legend?.trim() || fichier.original_name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">{Math.round(fichier.size / 1024)} Ko</p>
                            </div>
                            <button onClick={() => supprimerItem('galerie', fichier.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {imagesBaseSite.length === 0 && (
                      <p className="text-xs text-slate-500 text-center italic">Aucune image de base n'est encore enregistrée.</p>
                    )}
                  </div>
                </div>
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
            <div className="bg-[#af894d] rounded-full p-1"><Check className="w-4 h-4"/></div>
            <span className="text-sm font-semibold">{notif}</span>
            <button onClick={() => definirNotif(null)} className="ml-4 text-slate-400 hover:text-white"><X className="w-4 h-4"/></button>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
