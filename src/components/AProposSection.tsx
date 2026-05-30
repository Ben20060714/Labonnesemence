/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ShieldCheck, HeartPulse, History, Sparkles, X, Mail, Phone, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EQUIPE_DONNEES } from '../data';
import { MembreEquipe } from '../types';

export default function AProposSection() {
  const [membreSelectionne, definirMembreSelectionne] = useState<MembreEquipe | null>(null);

  const croyancesFondatrices = [
    {
      titre: 'La Liturgie Eucharistique',
      description: 'L’Eucharistie est la source et le sommet de toute la vie chrétienne. Nous centrons notre louange sur la prière sacrée.'
    },
    {
      titre: 'La Consolation et Compassion',
      description: 'Soutenir mutuellement les familles dans l’affliction, la solitude physique ou la détresse financière passagère.'
    },
    {
      titre: 'La Transmission de la Parole',
      description: 'Responsabiliser tous les catéchumènes en initiant les jeunes d’aujourd’hui à l’amour éternel révélé dans les Évangiles.'
    },
    {
      titre: 'L’Engagement de Service',
      description: 'La foi s’exprime concrètement par les œuvres d’amour fraternel. Nous militons pour le développement de l’entraide associative.'
    }
  ];

  return (
    <section id="qui-sommes-nous-screen" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-20">
      
      {/* 1. Notre Histoire et Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-7 space-y-6 text-left">
          <span className="font-mono text-xs uppercase tracking-widest text-[#af894d] dark:text-[#c29f63] block">
            Héritage et Intégration
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900 leading-tight dark:text-slate-100">
            Une Paroisse Centenaire, Un Esprit Résolument Contemporain
          </h1>
          <div className="w-20 h-0.5 bg-[#af894d]" />
          
          <div className="space-y-4 text-sm sm:text-base text-slate-600 font-light leading-relaxed dark:text-slate-400">
            <p>
              Fondée en 1912 au cœur de la ville, l'ancienne chapelle de l'Alliance est devenue au fil des générations un lieu d'ancrage spirituel incontournable pour des milliers de familles de croyants.
            </p>
            <p>
              Sous la nef lumineuse de style néo-gothique restaurée récemment, l'Alliance s’efforce aujourd'hui d'incarner une foi eucharistique rayonnante. Nous combinons le respect zélé des beautés liturgiques historiques avec un accueil audacieux et moderne pour les nouvelles générations en quête de vérité spirituelle et philosophique.
            </p>
          </div>
        </div>

        {/* Bloc graphique de la vision (Stained Glass Photo with Overlay & Simulation) */}
        <div className="lg:col-span-5 relative h-[360px] rounded-2xl overflow-hidden bg-slate-950 p-6 flex flex-col justify-end text-white border border-[#c29f63]/30">
          
          {/* Image de fond : Vitrail d'église réel */}
          <div className="absolute inset-0 z-0">
            <img
              src="../../img/MM_5.jpg"
              alt="Photo ancienne de l'église"
              className="w-full h-full object-cover brightness-45 contrast-125"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-950/40" />
          </div>

          {/* Vitrail simulé en SVG par-dessus l'image */}
          <div className="absolute inset-0 opacity-30 mix-blend-overlay z-0">
            <svg className="w-full h-full text-[#c29f63]" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Des motifs géométriques rappelant un portail de cathédrale */}
              <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="4" />
              <polygon points="200,50 350,200 200,350 50,200" stroke="currentColor" strokeWidth="2" />
              <line x1="200" y1="50" x2="200" y2="550" stroke="currentColor" strokeWidth="2" />
              <line x1="50" y1="200" x2="350" y2="200" stroke="currentColor" strokeWidth="2" />
              <circle cx="200" cy="200" r="80" stroke="currentColor" strokeWidth="2" />
              <path d="M 50 200 C 150 50 250 50 350 200" stroke="currentColor" strokeWidth="3" />
            </svg>
          </div>

          <div className="absolute top-0 right-0 p-6">
            <History className="w-10 h-10 text-[#c29f63]/80" />
          </div>

          <div className="relative space-y-3 z-10 text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#c29f63] font-bold">
              Vision de l'église
            </span>
            <blockquote className="font-serif text-lg italic text-[#e7d4b0]">
              « Ce qui unit est infiniment plus fort que ce qui sépare. Notre église est un asile de paix fraternel. »
            </blockquote>
            <p className="text-[11px] font-mono text-slate-400">
              — Dévise de l'église
            </p>
          </div>

        </div>

      </div>

      {/* 2. Notre Credo (Ce en quoi nous croyons) */}
      <div id="bloc-valeurs-credo" className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-[#af894d] dark:text-[#c29f63]">
            Notre Église
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-100">
            La bonne semence S’ancre sur Quatre bases
          </h2>
          <div className="w-16 h-0.5 bg-[#af894d] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {croyancesFondatrices.map((credo, index) => (
            <div
              key={index}
              className="flex gap-4 p-6 bg-slate-50 border border-[#f4ebd9]/40 rounded-xl dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="p-3 bg-white text-[#af894d] rounded-lg h-fit shadow-xs dark:bg-slate-800 dark:text-[#c29f63]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 text-left">
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">
                  {credo.titre}
                </h3>
                <p className="text-sm text-slate-600 font-light leading-relaxed dark:text-slate-400">
                  {credo.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. L'Équipe d'Animation Pastorale */}
      <div id="bloc-clerge-communaute" className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-[#af894d] dark:text-[#c29f63]">
            Vos Serviteurs Paroissiaux
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-100">
            L'Équipe Clergé et Laïcat
          </h2>
          <p className="text-sm text-slate-500 font-light dark:text-slate-400">
            Prêtres, diacres, consacrées et animateurs de chant dédiés à l'enrichissement de votre aventure ecclésiale. Cliquez sur un membre pour lire sa notice pastorale.
          </p>
          <div className="w-16 h-0.5 bg-[#af894d] mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EQUIPE_DONNEES.map((membre) => (
            <motion.div
              key={membre.identifiant}
              id={`carte-paroisse-membre-${membre.identifiant}`}
              layoutId={`contenant-membre-${membre.identifiant}`}
              onClick={() => definirMembreSelectionne(membre)}
              className="bg-white border border-[#f4ebd9]/60 rounded-xl p-6 text-center space-y-4 hover:shadow-md hover:border-[#af894d] transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#af894d] to-[#e7d4b0] rounded-full mx-auto flex items-center justify-center text-white text-2xl font-serif font-bold shadow-sm">
                {membre.initiales}
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                  {membre.nom}
                </h3>
                <p className="text-xs font-semibold text-[#c29f63] font-mono uppercase tracking-wider">
                  {membre.role}
                </p>
              </div>
              <p className="text-xs text-slate-500 font-light line-clamp-2 dark:text-slate-400 leading-relaxed">
                {membre.biographie}
              </p>
              <span className="inline-block text-[11px] font-bold text-slate-400 group-hover:text-slate-800 dark:text-slate-500 py-1 border-b border-transparent hover:border-[#c29f63] cursor-pointer">
                Lire la fiche complète →
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modale de description du membre (Pastoral Detail sheet) */}
      <AnimatePresence>
        {membreSelectionne && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay transparent de fermeture */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950 cursor-pointer"
              onClick={() => definirMembreSelectionne(null)}
            />

            {/* Fiche Pastorale Popover */}
            <motion.div
              id="fiche-pastorale-membre"
              layoutId={`contenant-membre-${membreSelectionne.identifiant}`}
              className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-800 z-10 dark:bg-slate-900 dark:text-slate-100"
            >
              <button
                id="bouton-fermer-fiche-membre"
                onClick={() => definirMembreSelectionne(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer dark:hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-tr from-[#af894d]/20 to-[#c29f63]/25 border-2 border-[#af894d] rounded-full mx-auto flex items-center justify-center text-[#af894d] text-3xl font-serif font-bold dark:text-[#c29f63]">
                  {membreSelectionne.initiales}
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-serif text-2xl font-bold">
                    {membreSelectionne.nom}
                  </h4>
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#c29f63]">
                    {membreSelectionne.role}
                  </p>
                </div>
              </div>

              {/* Biographie complète */}
              <div className="space-y-4 border-t border-slate-50 pt-5 text-sm font-light text-slate-600 leading-relaxed dark:text-slate-400 dark:border-slate-850">
                <p>{membreSelectionne.biographie}</p>
                
                <p className="text-xs italic bg-[#fcfaf4] p-3 border border-[#f4ebd9]/60 rounded dark:bg-slate-850 dark:border-slate-800">
                  « Être au service de cette paroisse me remplit chaque jour de joie pastorale et me donne l'opportunité de témoigner de l'amour divin auprès de vous tous. »
                </p>
              </div>

              {/* Contacts de service simulés */}
              <div className="space-y-2 text-xs font-mono text-slate-500 pt-2 dark:text-slate-450 border-t border-slate-50 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#af894d]" />
                  <span>{membreSelectionne.initiales.toLowerCase()}@paroisse-alliance.fr</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#af894d]" />
                  <span>+33 (0)1 45 67 89 {membreSelectionne.identifiant === 'membre-1' ? '21' : '30'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-[#af894d]" />
                  <span>Installé à l'Alliance depuis 2020</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
