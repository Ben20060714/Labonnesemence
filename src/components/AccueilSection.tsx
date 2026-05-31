/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Gift, Heart, MapPin, Play, Users, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { SERMONS_DONNEES, EVENEMENTS_DONNEES } from '../data';

// Helper pour la durée automatique
function DureeAudioAuto({ url }: { url: string }) {
  const [duree, definirDuree] = useState<string>('Chargement...');

  useEffect(() => {
    const audio = new Audio(url);
    const handleMeta = () => {
      const mins = Math.floor(audio.duration / 60);
      const secs = Math.floor(audio.duration % 60);
      definirDuree(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    audio.addEventListener('loadedmetadata', handleMeta);
    return () => audio.removeEventListener('loadedmetadata', handleMeta);
  }, [url]);

  return <span>{duree}</span>;
}

interface AccueilSectionProps {
  redirigerVersPage: (page: string) => void;
}

export default function AccueilSection({ redirigerVersPage }: AccueilSectionProps) {
  const dernierSermon = SERMONS_DONNEES[0];
  const prochainEvenement = EVENEMENTS_DONNEES[0];

  const piliersParoissiaux = [
    {
      identifiant: 'pilier-foi',
      icone: <BookOpen className="w-6 h-6 text-[#c29f63]" />,
      titre: 'La parole de DIeu',
      description: 'Nourrir notre foi chrétienne à l’écoute de la parole de Dieu.'
    },
    {
      identifiant: 'pilier-fraternite',
      icone: <Users className="w-6 h-6 text-[#c29f63]" />,
      titre: 'La Communion Fraternelle',
      description: 'Accueillir chaleureuseument chaque personne de tout âge et partager des instants d’entraide spirituelle.'
    },
    {
      identifiant: 'pilier-social',
      icone: <Heart className="w-6 h-6 text-[#c29f63]" />,
      titre: 'L’Action Solidaire : l’amour',
      description: 'Aimer jusqu’à servir les personnes démunies, visiter les malades.'
    }
  ];

  return (
    <div id="section-accueil-complete" className="space-y-20 pb-20">
      
      {/* 1. Hero Banner avec animations raffinées */}
      <section id="banniere-accueil-hero" className="relative min-h-[78vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white px-4 py-24">
        {/* Image de fond*/}
        <div className="absolute inset-0 z-0">
          <img src="../../img/Hero_pic.jpg" alt="Intérieur" className="w-full h-full object-cover object-center filter brightness-75 contrast-105" referrerPolicy="no-referrer"/>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950/95"/>
        </div>

        {/* Motif SVG en arrière-plan */}
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay z-0">
          <svg className="w-full h-full text-[#c29f63]" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 100 1000 Q 100 200 500 200 Q 900 200 900 1000" stroke="currentColor" strokeWidth="6" />
            <path d="M 200 1000 Q 200 400 500 400 Q 800 400 800 1000" stroke="currentColor" strokeWidth="4" />
            <path d="M 300 1000 Q 300 550 500 550 Q 700 550 700 1000" stroke="currentColor" strokeWidth="2" />
            <line x1="500" y1="200" x2="500" y2="1000" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
          </svg>
        </div>

        {/* Halo lumineux*/}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0"/>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#c29f63] inline-block bg-[#c29f63]/10 px-3.5 py-1.5 rounded-full">
              Bienvenue dans votre communauté
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-tight">
              La bonne semence <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e7d4b0] via-[#c29f63] to-[#e7d4b0] bg-300% animate-pulse">
                Unie par lorem ipsum dolor sit
              </span>
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-base sm:text-lg text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
            Retrouvez tous vos enseignements, vos programmes, les dévotions, vos divertissements ici.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              id="bouton-vers-evenements-hero"
              onClick={() => redirigerVersPage('evenements')}
              className="w-full sm:w-auto px-8 py-4 rounded-md bg-[#af894d] hover:bg-[#c29f63] text-sm tracking-wider font-semibold uppercase shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Reviser les programmes
            </button>
            <button
              id="bouton-vers-communaute-hero"
              onClick={() => redirigerVersPage('communaute')}
              className="w-full sm:w-auto px-8 py-4 rounded-md border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-sm tracking-wider font-semibold uppercase transition-all cursor-pointer"
            >
              La communauté
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. Prochain culte / Prochain Événement (Bento minimaliste) */}
      <section id="section-annonce-dimanche" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50 rounded-2xl border border-[#f4ebd9] p-8 dark:bg-slate-800/50 dark:border-slate-800">
          
          <div className="lg:col-span-4 flex flex-col justify-center space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#af894d] dark:text-[#c29f63]">
              Au Programme
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
              Prochain culte
            </h2>
            <p className="text-sm text-slate-500 font-light dark:text-slate-400">
              Venez participer à notre activité hebdomadaire d'enseignement biblique.
            </p>
            <div>
              <button
                id="bouton-voir-tous-evenements"
                onClick={() => redirigerVersPage('evenements')}
                className="text-xs font-bold uppercase tracking-wider text-[#af894d] hover:text-[#936f3c] flex items-center gap-1 cursor-pointer dark:text-[#c29f63]"
              >
                Calendrier →
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white border border-[#f4ebd9]/80 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="space-y-4">
              <span className="px-3 py-1 bg-amber-50 text-[#af894d] text-[11px] font-semibold font-mono uppercase rounded dark:bg-amber-950/40 dark:text-amber-400">
                {prochainEvenement.categorie}
              </span>
              <h3 className="font-serif text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {prochainEvenement.titre}
              </h3>
              <p className="text-sm text-slate-600 font-light max-w-md dark:text-slate-400">
                {prochainEvenement.description}
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#af894d]" /> {prochainEvenement.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#af894d]" /> {prochainEvenement.lieu}
                </span>
              </div>
            </div>

            <button
              id="bouton-sinscrire-evenement-rapide"
              onClick={() => redirigerVersPage('evenements')}
              className="px-6 py-3 rounded text-xs font-bold uppercase tracking-wider bg-slate-900 text-white hover:bg-[#af894d] transition-all cursor-pointer dark:bg-slate-800 dark:hover:bg-[#af894d]"
            >
              En savoir plus
            </button>
          </div>

        </div>
      </section>

      {/* 3. Les Trois Piliers de l’église */}
      <section id="section-valeurs-piliers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-[#af894d] dark:text-[#c29f63]">
            Fondations de Notre Vie Commune
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-100">
            l’église S’articule Autour du Cœur
          </h2>
          <div className="w-16 h-0.5 bg-[#af894d] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {piliersParoissiaux.map((pilier) => (
            <div
              key={pilier.identifiant}
              id={pilier.identifiant}
              className="bg-white border border-[#f4ebd9]/60 rounded-xl p-8 hover:border-[#af894d] shadow-sm hover:shadow-md transition-all group dark:bg-slate-900 dark:border-slate-800 dark:hover:border-[#c29f63]"
            >
              <div className="p-3 bg-amber-50 rounded-xl w-fit mb-6 transition-colors group-hover:bg-[#c29f63]/10 dark:bg-slate-800">
                {pilier.icone}
              </div>
              <h3 className="font-serif text-xl font-semibold text-slate-900 mb-3 dark:text-slate-100">
                {pilier.titre}
              </h3>
              <p className="text-sm text-slate-600 font-light leading-relaxed dark:text-slate-400">
                {pilier.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Focus Dernier Sermon / Homélie */}
      <section id="section-homelie-focus" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-8 sm:p-12 border border-slate-800">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-mono uppercase tracking-widest text-[#c29f63]">
                Dernier Enseignement
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white">
                {dernierSermon.titre}
              </h2>
              <p className="text-sm font-light text-slate-300 italic">
                « {dernierSermon.passageBiblique} » — Predication du {dernierSermon.date}
              </p>
              <p className="text-sm text-slate-400 font-light leading-relaxed max-w-2xl">
                {dernierSermon.resume}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-200">{dernierSermon.orateur}</span>
                <span>•</span>
                <span className="font-mono flex items-center gap-1"><Clock className="w-3 h-3"/> <DureeAudioAuto url={(dernierSermon as any).urlAudio} /></span>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-start lg:justify-end">
              <button id="bouton-ecouter-sermon-accueil" onClick={() => redirigerVersPage('sermons')} className="group flex items-center gap-4 bg-white/5 border border-white/10 hover:border-[#c29f63]/50 hover:bg-white/10 px-6 py-5 rounded-xl transition-all cursor-pointer w-full sm:w-auto">
                <div className="p-3.5 bg-[#c29f63] rounded-full text-slate-950 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <div className="text-left">
                  <span className="block text-xs uppercase tracking-widest text-[#c29f63] font-mono">
                    Enregistrement Audio
                  </span>
                  <span className="block text-sm font-medium text-slate-100 group-hover:text-white">
                    Écouter la prédication
                  </span>
                </div>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Galerie de l'église (Places for outstanding imagery) */}
      <section id="galerie-communautaire" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-[#af894d] dark:text-[#c29f63]">
            Nos meilleurs moments
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-100">
            La Vie communaitaire en Images
          </h2>
          <div className="w-16 h-0.5 bg-[#af894d] mx-auto" />
          <p className="text-sm text-slate-500 font-light dark:text-slate-400">
            Lorem ipsum dolor sit amet adipiscing consectetur elit quam.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              titre: '30ème Fête d’anniversaire de l’église',
              image: '../../img/MM_1.jpg',
              descr: 'Les rires qui éclatent de partout, c’est ça la vie.'
            },
            {
              titre: 'Sortie avec la jeunesse JPC',
              image: '../../img/MM_2.jpg',
              descr: 'Sortie avec la jeunesse de l’église en colombie : une belle journée.'
            },
            {
              titre: 'Chorales & Chants',
              image: '../../img/MM_3.jpg',
              descr: 'Les Nyimbo za Wokovu & Nyimbo za Mungu avec le Frère Patrick.'
            },
            {
              titre: 'Mouvement de charité',
              image: '../../img/MM_4.jpg',
              descr: 'Déscente dans l’orphelinat Katena.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="group overflow-hidden rounded-xl bg-white border border-[#f4ebd9]/60 shadow-sm hover:shadow-md transition-all duration-300 dark:bg-slate-900 dark:border-slate-800">
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.titre}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5 text-left space-y-1">
                <h4 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {item.titre}
                </h4>
                <p className="text-xs text-slate-500 font-light dark:text-slate-400">
                  {item.descr}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Appel à la solidarité / Dons */}
      <section id="section-dons-accueil" className="bg-[#fcfaf4] py-16 transition-colors dark:bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="p-3.5 bg-amber-50 text-[#af894d] rounded-full w-fit mx-auto dark:bg-slate-800 dark:text-[#c29f63]">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
            Soutenir les commités de l’église
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-light max-w-2xl mx-auto leading-relaxed dark:text-slate-400">
            Grâce à votre générosité matérielle, nous pouvons maintenir notre église ouverte en journée, secourir les plus pauvres via nos journée de charité. Merci pour votre don et votre présence constante.
          </p>
          <div>
            <button
              id="bouton-vers-dons-accueil"
              onClick={() => redirigerVersPage('contact-dons')}
              className="px-8 py-3 rounded-md text-xs font-bold uppercase tracking-widest text-white bg-[#af894d] hover:bg-[#936f3c] transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              Faire un offrande / Soutenir
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
