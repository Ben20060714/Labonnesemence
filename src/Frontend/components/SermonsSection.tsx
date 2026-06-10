/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Search, Play, Pause, Headphones, Calendar, Compass, Volume2, VolumeX, Square, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SERMONS_DONNEES } from '../data';
import { Sermon } from '../types';
import { api } from '../services/api';

// Composant pour extraire et afficher la durée d'un fichier audio
function AffichageDureeDynamique({ url }: { url: string }) {
  const [duree, definirDuree] = useState<string>('--:--');

  useEffect(() => {
    const audioTemp = new Audio(url);
    const chargerMeta = () => {
      const minutes = Math.floor(audioTemp.duration / 60);
      const secondes = Math.floor(audioTemp.duration % 60);
      definirDuree(`${minutes.toString().padStart(2, '0')}:${secondes.toString().padStart(2, '0')}`);
    };
    audioTemp.addEventListener('loadedmetadata', chargerMeta);
    return () => audioTemp.removeEventListener('loadedmetadata', chargerMeta);
  }, [url]);

  return <span>{duree}</span>;
}

export default function SermonsSection() {
  const [listeSermons, definirListeSermons] = useState<Sermon[]>(SERMONS_DONNEES);
  const [chargement, definirChargement] = useState<boolean>(true);
  const [recherche, definirRecherche] = useState<string>('');
  const [categorieFiltree, definirCategorieFiltree] = useState<string>('Tous');
  
  // États de lecture Audio
  const [idSermonEnCours, definirIdSermonEnCours] = useState<string | null>(null);
  const [lectureEnCours, definirLectureEnCours] = useState<boolean>(false);
  const [tempsActuel, definirTempsActuel] = useState<number>(0);
  const [dureeTotale, definirDureeTotale] = useState<number>(0);
  const [audioSuivantSourdine, definirAudioSuivantSourdine] = useState<boolean>(false);

  // Référence à l'élément audio HTML5
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let composantActif = true;

    api.listerSermons()
      .then((sermonsApi) => {
        if (composantActif && sermonsApi.length > 0) {
          definirListeSermons(sermonsApi);
        }
      })
      .catch((erreur) => {
        console.error('Chargement des sermons depuis API impossible:', erreur);
      })
      .finally(() => {
        if (composantActif) definirChargement(false);
      });

    return () => {
      composantActif = false;
    };
  }, []);

  // Initialiser l'audio au montage
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;

    const mettreAJourProgression = () => {
      definirTempsActuel(audio.currentTime);
    };

    const chargerMetadonnees = () => {
      definirDureeTotale(audio.duration);
    };

    const gererFinLecture = () => {
      definirLectureEnCours(false);
      definirTempsActuel(0);
    };

    audio.addEventListener('timeupdate', mettreAJourProgression);
    audio.addEventListener('loadedmetadata', chargerMetadonnees);
    audio.addEventListener('ended', gererFinLecture);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', mettreAJourProgression);
      audio.removeEventListener('loadedmetadata', chargerMetadonnees);
      audio.removeEventListener('ended', gererFinLecture);
    };
  }, []);

  // Synchroniser l'état de lecture et sourdine avec l'élément audio
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (lectureEnCours) {
      audioRef.current.play().catch(err => console.error("Erreur lecture:", err));
    } else {
      audioRef.current.pause();
    }
    audioRef.current.muted = audioSuivantSourdine;
  }, [lectureEnCours, audioSuivantSourdine, idSermonEnCours]);

  // Utilitaire pour formater les secondes en MM:SS
  const formaterTemps = (secondes: number) => {
    if (isNaN(secondes)) return "00:00";
    const minutes = Math.floor(secondes / 60);
    const restesSecondes = Math.floor(secondes % 60);
    return `${minutes.toString().padStart(2, '0')}:${restesSecondes.toString().padStart(2, '0')}`;
  };

  const obtenirImageSermon = (identifiant: string) => {
    switch (identifiant) {
      case 'sermon-1':
        return 'https://images.unsplash.com/photo-1544764200-d834fd210a23?auto=format&fit=crop&q=80&w=400';
      case 'sermon-2':
        return 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=400';
      case 'sermon-3':
        return 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400';
      case 'sermon-4':
        return 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=400';
      case 'sermon-5':
        return 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=400';
      default:
        return 'https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?auto=format&fit=crop&q=80&w=400';
    }
  };

  const sermonsFiltres = listeSermons.filter((sermon) => {
    const correspondRecherche =
      sermon.titre.toLowerCase().includes(recherche.toLowerCase()) ||
      sermon.orateur.toLowerCase().includes(recherche.toLowerCase()) ||
      sermon.passageBiblique.toLowerCase().includes(recherche.toLowerCase()) ||
      sermon.resume.toLowerCase().includes(recherche.toLowerCase());
    
    const correspondCategorie =
      categorieFiltree === 'Tous' || sermon.categorie === categorieFiltree;

    return correspondRecherche && correspondCategorie;
  });

  const declencherLectureAudio = (idSermon: string) => {
    const sermon = listeSermons.find(s => s.identifiant === idSermon);
    if (!sermon || !audioRef.current) return;

    if (idSermonEnCours === idSermon) {
      definirLectureEnCours(!lectureEnCours);
    } else {
      // Changer de morceau
      audioRef.current.src = (sermon as any).urlAudio;
      definirIdSermonEnCours(idSermon);
      definirLectureEnCours(true);
      definirTempsActuel(0);
    }
  };

  const arreterLectureAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    definirIdSermonEnCours(null);
    definirLectureEnCours(false);
    definirTempsActuel(0);
  };

  const sermonSelectionne = listeSermons.find((s) => s.identifiant === idSermonEnCours);

  return (
    <section id="sermons-enseignements-screen" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      
      {/* Titre et introduction */}
      <div className="space-y-4 max-w-3xl">
        <span className="font-mono text-xs uppercase tracking-widest text-[#af894d] dark:text-[#c29f63] block">
          Ressources
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900 leading-tight dark:text-slate-100">
          Revue des Enseignements
        </h1>
        <p className="text-base text-slate-600 font-light dark:text-slate-400">
          Retrouvez tous vos enseignements et messages. Filtrez par thématique ou recherchez un verset biblique spécifique.
        </p>
        {chargement && (
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Chargement des enseignements...
          </p>
        )}
      </div>

      {/* Barre de Filtres et Recherche */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 border border-[#f4ebd9] p-5 rounded-xl dark:bg-slate-900/50 dark:border-slate-800">
        
        {/* Recherche input */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            id="barre-recherche-audio"
            placeholder="Rechercher par titre, orateur, verset biblique..."
            value={recherche}
            onChange={(e) => definirRecherche(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm rounded bg-white text-slate-800 border border-[#e7d4b0] outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] transition-all dark:bg-slate-900 dark:border-slate-850 dark:text-slate-100"
          />
        </div>

        {/* Categories filters */}
        <div id="bloc-filtre-categories" className="md:col-span-6 flex flex-wrap gap-2 justify-start md:justify-end">
          {['Tous', 'Dimanche', 'Enseignement', 'Fête'].map((theme) => {
            const estActif = categorieFiltree === theme;
            return (
              <button
                key={theme}
                id={`filtre-bouton-${theme}`}
                onClick={() => definirCategorieFiltree(theme)}
                className={`px-4 py-2.5 rounded text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                  estActif
                    ? 'bg-[#af894d] text-white shadow'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-450 dark:border-slate-800 dark:hover:bg-slate-800'
                }`}
              >
                {theme === 'Tous' ? 'Toutes Catégories' : theme}
              </button>
            );
          })}
        </div>

      </div>

      {/* Liste des sermons */}
      <div id="liste-sermons-contenant" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sermonsFiltres.length > 0 ? (
          sermonsFiltres.map((sermon) => {
            const estSermonActif = idSermonEnCours === sermon.identifiant;
            const estEnTrainDeJouer = estSermonActif && lectureEnCours;

            return (
              <motion.div
                key={sermon.identifiant}
                id={`carte-sermon-${sermon.identifiant}`}
                layout
                className={`bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all ${
                  estSermonActif
                    ? 'border-[#af894d] dark:border-[#c29f63]'
                    : 'border-[#f4ebd9]/60 dark:border-slate-800'
                } dark:bg-slate-900 flex flex-col justify-between`}
              >
                {/* Illustration thématique du sermon */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={obtenirImageSermon(sermon.identifiant)}
                    alt={sermon.titre}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
                </div>

                <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
                  <div className="space-y-4">
                    
                    {/* Categorisation & Date */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest font-semibold text-[#af894d] bg-amber-50 dark:bg-[#c29f63]/10 dark:text-[#c29f63] px-2 py-1 rounded">
                        {sermon.categorie}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-light font-mono">
                        <Calendar className="w-3.5 h-3.5" /> {sermon.date}
                      </span>
                    </div>

                    {/* Titre et détails */}
                    <div className="space-y-1">
                      <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100 hover:text-[#af894d] transition-colors">
                        {sermon.titre}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 dark:text-slate-400">
                        <Book className="w-3.5 h-3.5 text-slate-400" /> Verset : {sermon.passageBiblique}
                      </p>
                    </div>

                    {/* Résumé court */}
                    <p className="text-sm text-slate-600 font-light leading-relaxed dark:text-slate-450">
                      {sermon.resume}
                    </p>

                  </div>

                  {/* Pied de la carte avec bouton de lecture */}
                  <div className="pt-5 border-t border-slate-50 flex items-center justify-between dark:border-slate-850">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {sermon.orateur}
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#c29f63]">
                        Prédicateur
                      </span>
                    </div>

                    <button
                      id={`bouton-ecoute-${sermon.identifiant}`}
                      onClick={() => declencherLectureAudio(sermon.identifiant)}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                        estEnTrainDeJouer
                          ? 'bg-[#c29f63] text-slate-950'
                          : 'bg-slate-900 text-white hover:bg-[#af894d] dark:bg-slate-800 dark:hover:bg-[#af894d]'
                      }`}
                    >
                      {estEnTrainDeJouer ? (
                        <>
                          <Pause className="w-3.5 h-3.5" /> <span className="hidden xs:inline">En cours</span><span className="xs:hidden">Lecture</span>
                        </>
                      ) : (
                        <>
                        <Play className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Écouter • </span> <AffichageDureeDynamique url={sermon.urlAudio} />
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center space-y-3 bg-slate-50 rounded-xl border border-dashed border-[#e7d4b0] dark:bg-slate-900/20 dark:border-slate-800">
            <Compass className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-slate-500 text-sm font-light">
              Aucun sermon ne correspond à vos critères de recherche.
            </p>
            <button
              id="bouton-reinitialiser-recherche-sermon"
              onClick={() => { definirRecherche(''); definirCategorieFiltree('Tous'); }}
              className="text-xs font-bold uppercase tracking-widest text-[#af894d] hover:text-[#936f3c] cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Lecteur de Musique / Sermon persistant en bas */}
      <AnimatePresence>
        {idSermonEnCours && sermonSelectionne && (
          <motion.div
            id="lecteur-audio-persistant-bar"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 dark:bg-slate-950 text-white border-t border-[#c29f63]/30 px-6 py-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4"
          >
            {/* Info Sermon */}
            <div className="flex items-center gap-4 w-full md:w-1/3">
              <div className="p-3 bg-[#c29f63]/20 rounded-lg text-[#c29f63] hidden sm:block">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="truncate text-left">
                <h4 className="font-serif text-sm font-semibold tracking-wide text-slate-100 truncate">
                  {sermonSelectionne.titre}
                </h4>
                <p className="text-[11px] font-mono text-slate-400 truncate">
                  {sermonSelectionne.orateur} • {sermonSelectionne.passageBiblique}
                </p>
              </div>
            </div>

            {/* Contrôles Principaux */}
            <div className="items-center flex flex-col gap-2 w-full md:w-1/3">
              <div className="flex items-center gap-4">
                <button
                  id="bouton-lecteur-arret"
                  onClick={arreterLectureAudio}
                  className="p-1.5 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Arrêter"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>

                <button
                  id="bouton-lecteur-lecture"
                  onClick={() => declencherLectureAudio(sermonSelectionne.identifiant)}
                  className="p-3 bg-[#c29f63] hover:bg-amber-600 rounded-full text-slate-950 shadow-md transform hover:scale-105 transition-all cursor-pointer"
                >
                  {lectureEnCours ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  id="bouton-lecteur-sourdine"
                  onClick={() => definirAudioSuivantSourdine(!audioSuivantSourdine)}
                  className="p-1.5 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title={audioSuivantSourdine ? 'Rétablir le son' : 'Rendre muet'}
                >
                  {audioSuivantSourdine ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Barre de timeline temporelle */}
              <div className="w-full flex items-center gap-3 text-[10px] font-mono text-slate-400">
                <span>{formaterTemps(tempsActuel)}</span>
                <div className="relative flex-1 h-1 bg-slate-700 rounded-full overflow-hidden cursor-pointer group">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-[#c29f63] transition-all"
                    style={{ width: `${(tempsActuel / (dureeTotale || 1)) * 100}%` }}
                  />
                </div>
                <span>{formaterTemps(dureeTotale)}</span>
              </div>
            </div>

            {/* Equaliseur visuel simulé */}
            <div className="hidden md:flex items-center gap-1 h-5 w-1/3 justify-end text-[#c29f63]">
              {lectureEnCours ? (
                [...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] bg-[#c29f63] rounded-sm"
                    animate={{
                      height: [4, 18, 6, 20, 10, 4][i % 6],
                      y: [0, 2, 0, -2, 1, 0][i % 6],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.5 + i * 0.1,
                      repeatType: 'reverse',
                    }}
                    style={{ height: '14px' }}
                  />
                ))
              ) : (
                <div className="text-xs font-light text-slate-500 font-mono">
                  Lecture en pause
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
