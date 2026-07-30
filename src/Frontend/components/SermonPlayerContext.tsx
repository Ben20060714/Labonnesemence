/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Headphones, Pause, Play, RotateCcw, RotateCw, Square, Volume2, VolumeX } from 'lucide-react';
import type { Sermon } from '../types';
import type { ReactNode } from 'react';

type SermonLecture = Pick<Sermon, 'identifiant' | 'titre' | 'orateur' | 'passageBiblique' | 'urlAudio'>;

interface SegmentAudio {
  index: number;
  debut: number;
  fin: number;
  etiquette: string;
}

interface SermonPlayerContextValue {
  sermonCourant: SermonLecture | null;
  lectureEnCours: boolean;
  tempsActuel: number;
  dureeTotale: number;
  sourdine: boolean;
  segments: SegmentAudio[];
  segmentActifIndex: number;
  jouerSermon: (sermon: SermonLecture) => void;
  basculerLecture: () => void;
  arreterLecture: () => void;
  basculerSourdine: () => void;
  seekTo: (temps: number) => void;
  seekBy: (delta: number) => void;
  allerAuSegment: (index: number) => void;
  formaterTemps: (secondes: number) => string;
}

const SermonPlayerContext = createContext<SermonPlayerContextValue | null>(null);

export function SermonPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [sermonCourant, definirSermonCourant] = useState<SermonLecture | null>(null);
  const [lectureEnCours, definirLectureEnCours] = useState(false);
  const [tempsActuel, definirTempsActuel] = useState(0);
  const [dureeTotale, definirDureeTotale] = useState(0);
  const [sourdine, definirSourdine] = useState(false);

  const nombreSegments = dureeTotale > 0 ? Math.min(6, Math.max(3, Math.ceil(dureeTotale / 300))) : 0;
  const segments: SegmentAudio[] = Array.from({ length: nombreSegments }, (_segment, index) => {
      const tailleSegment = dureeTotale / nombreSegments;
      const debut = index * tailleSegment;
      const fin = index === nombreSegments - 1 ? dureeTotale : (index + 1) * tailleSegment;

      return {
        index,
        debut,
        fin,
        etiquette: `Segment ${index + 1}`,
      };
    });
  const segmentActifIndex = segments.findIndex((segment) => tempsActuel >= segment.debut && tempsActuel <= segment.fin);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const synchroniserTemps = () => {
      definirTempsActuel(audio.currentTime);
      definirDureeTotale(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const gererChargement = () => {
      definirTempsActuel(audio.currentTime);
      definirDureeTotale(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const gererLecture = () => definirLectureEnCours(true);
    const gererPause = () => definirLectureEnCours(false);
    const gererFin = () => {
      definirLectureEnCours(false);
      definirTempsActuel(0);
    };

    audio.addEventListener('timeupdate', synchroniserTemps);
    audio.addEventListener('loadedmetadata', gererChargement);
    audio.addEventListener('durationchange', gererChargement);
    audio.addEventListener('play', gererLecture);
    audio.addEventListener('pause', gererPause);
    audio.addEventListener('ended', gererFin);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', synchroniserTemps);
      audio.removeEventListener('loadedmetadata', gererChargement);
      audio.removeEventListener('durationchange', gererChargement);
      audio.removeEventListener('play', gererLecture);
      audio.removeEventListener('pause', gererPause);
      audio.removeEventListener('ended', gererFin);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = sourdine;
  }, [sourdine]);

  const formaterTemps = (secondes: number) => {
    if (!Number.isFinite(secondes) || secondes < 0) return '00:00';
    const minutes = Math.floor(secondes / 60);
    const restesSecondes = Math.floor(secondes % 60);
    return `${minutes.toString().padStart(2, '0')}:${restesSecondes.toString().padStart(2, '0')}`;
  };

  const chargerSermon = async (sermon: SermonLecture) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const changerMorceau = sermonCourant?.identifiant !== sermon.identifiant;

    if (changerMorceau) {
      definirSermonCourant(sermon);
      definirTempsActuel(0);
      audio.src = sermon.urlAudio;
      audio.currentTime = 0;
      audio.load();
    }

    try {
      await audio.play();
      definirLectureEnCours(true);
    } catch (error) {
      console.error('Lecture audio impossible:', error);
      definirLectureEnCours(false);
    }
  };

  const basculerLecture = () => {
    if (!audioRef.current || !sermonCourant) return;

    if (lectureEnCours) {
      audioRef.current.pause();
      return;
    }

    void chargerSermon(sermonCourant);
  };

  const arreterLecture = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    definirSermonCourant(null);
    definirLectureEnCours(false);
    definirTempsActuel(0);
    definirDureeTotale(0);
  };

  const basculerSourdine = () => {
    definirSourdine((valeur) => !valeur);
  };

  const seekTo = (temps: number) => {
    if (!audioRef.current || !sermonCourant) return;

    const borne = Math.min(Math.max(temps, 0), Number.isFinite(audioRef.current.duration) ? audioRef.current.duration : temps);
    audioRef.current.currentTime = borne;
    definirTempsActuel(borne);
  };

  const seekBy = (delta: number) => {
    if (!audioRef.current) return;
    seekTo(audioRef.current.currentTime + delta);
  };

  const allerAuSegment = (index: number) => {
    const segment = segments[index];
    if (!segment) return;
    seekTo(segment.debut);
  };

  const contexte: SermonPlayerContextValue = {
    sermonCourant,
    lectureEnCours,
    tempsActuel,
    dureeTotale,
    sourdine,
    segments,
    segmentActifIndex,
    jouerSermon: (sermon) => {
      void chargerSermon(sermon);
    },
    basculerLecture,
    arreterLecture,
    basculerSourdine,
    seekTo,
    seekBy,
    allerAuSegment,
    formaterTemps,
  };

  return (
    <SermonPlayerContext.Provider value={contexte}>
      {children}
    </SermonPlayerContext.Provider>
  );
}

export function useSermonPlayer() {
  const contexte = useContext(SermonPlayerContext);
  if (!contexte) {
    throw new Error('useSermonPlayer doit être utilisé à l’intérieur de SermonPlayerProvider.');
  }

  return contexte;
}

export function SermonPlayerBar() {
  const {
    sermonCourant,
    lectureEnCours,
    tempsActuel,
    dureeTotale,
    sourdine,
    segments,
    segmentActifIndex,
    basculerLecture,
    arreterLecture,
    basculerSourdine,
    seekTo,
    seekBy,
    allerAuSegment,
    formaterTemps,
  } = useSermonPlayer();

  if (!sermonCourant) return null;

  return (
    <motion.aside
      initial={{ y: 36, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 36, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#c29f63]/30 bg-slate-950 text-white shadow-2xl"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden rounded-full bg-[#c29f63]/20 p-3 text-[#c29f63] sm:block">
              <Headphones className="h-5 w-5"/>
            </div>
            <div className="min-w-0">
              <p className="truncate font-serif text-sm font-semibold text-slate-100 sm:text-base">
                {sermonCourant.titre}
              </p>
              <p className="truncate text-[11px] font-mono text-slate-400 sm:text-xs">
                {sermonCourant.orateur} • {sermonCourant.passageBiblique}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => allerAuSegment(Math.max(segmentActifIndex - 1, 0))}
              className="rounded-full border border-white/10 p-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
              title="Segment précédent"
              disabled={segmentActifIndex <= 0}
            >
              <ChevronLeft className="h-4 w-4"/>
            </button>

            <button
              type="button"
              onClick={() => seekBy(-15)}
              className="rounded-full border border-white/10 p-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              title="Reculer de 15 secondes"
            >
              <RotateCcw className="h-4 w-4"/>
            </button>

            <button
              type="button"
              onClick={basculerLecture}
              className="rounded-full bg-[#c29f63] p-3 text-slate-950 transition-transform hover:scale-105"
              title={lectureEnCours ? 'Mettre en pause' : 'Reprendre la lecture'}
            >
              {lectureEnCours ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4 ml-0.5"/>}
            </button>

            <button
              type="button"
              onClick={() => seekBy(15)}
              className="rounded-full border border-white/10 p-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              title="Avancer de 15 secondes"
            >
              <RotateCw className="h-4 w-4"/>
            </button>

            <button
              type="button"
              onClick={() => allerAuSegment(Math.min(segmentActifIndex + 1, Math.max(segments.length - 1, 0)))}
              className="rounded-full border border-white/10 p-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent"
              title="Segment suivant"
              disabled={segmentActifIndex < 0 || segmentActifIndex >= segments.length - 1}
            >
              <ChevronRight className="h-4 w-4"/>
            </button>

            <button
              type="button"
              onClick={basculerSourdine}
              className="rounded-full border border-white/10 p-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              title={sourdine ? 'Rétablir le son' : 'Rendre muet'}
            >
              {sourdine ? <VolumeX className="h-4 w-4"/> : <Volume2 className="h-4 w-4"/>}
            </button>

            <button
              type="button"
              onClick={arreterLecture}
              className="rounded-full border border-white/10 p-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              title="Arrêter"
            >
              <Square className="h-4 w-4 fill-current"/>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 sm:text-xs">
          <span className="min-w-[40px] text-right">{formaterTemps(tempsActuel)}</span>
          <input
            type="range"
            min="0"
            max={Math.max(dureeTotale, 0)}
            step="0.1"
            value={Math.min(tempsActuel, dureeTotale || tempsActuel)}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-[#c29f63]"
            aria-label="Navigation audio"
            disabled={!dureeTotale}
          />
          <span className="min-w-[40px]">{formaterTemps(dureeTotale)}</span>
        </div>

        {segments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {segments.map((segment, index) => {
              const estActif = index === segmentActifIndex;

              return (
                <button
                  key={segment.etiquette}
                  type="button"
                  onClick={() => allerAuSegment(index)}
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                    estActif
                      ? 'border-[#c29f63] bg-[#c29f63] text-slate-950'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                  }`}
                  title={`${formaterTemps(segment.debut)} - ${formaterTemps(segment.fin)}`}
                >
                  {segment.etiquette}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.aside>
  );
}
