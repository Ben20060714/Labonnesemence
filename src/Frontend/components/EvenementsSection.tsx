/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Bell } from 'lucide-react';
import { Evenement } from '../types';
import { api } from '../services/api';
import HeroPic from '../../../img/Hero_pic.jpg';
import MM1 from '../../../img/MM_1.jpg';
import MM4 from '../../../img/MM_4.jpg';
import MM5 from '../../../img/MM_5.jpg';

const imagesParDefaut = [HeroPic, MM1, MM4, MM5];

function obtenirImageEvenement(identifiant: string): string {
  const index = Number.parseInt(identifiant.replace(/\D+/g, ''), 10);
  if (Number.isFinite(index) && index > 0) {
    return imagesParDefaut[(index - 1) % imagesParDefaut.length];
  }

  return imagesParDefaut[0];
}

export default function EvenementsSection() {
  const [evenements, definirEvenements] = useState<Evenement[]>([]);
  const [chargement, definirChargement] = useState<boolean>(true);
  const [filtreCategorie, definirFiltreCategorie] = useState<string>('Tous');
  
  useEffect(() => {
    let composantActif = true;

    api.listerEvenements()
      .then((evenementsApi) => {
        if (composantActif) {
          definirEvenements(evenementsApi);
        }
      })
      .catch((erreur) => {
        console.error('Chargement des événements depuis API impossible:', erreur);
      })
      .finally(() => {
        if (composantActif) definirChargement(false);
      });

    return () => {
      composantActif = false;
    };
  }, []);

  const evenementsFiltrés = evenements.filter((evt) => {
    return filtreCategorie === 'Tous' || evt.categorie === filtreCategorie;
  });

  // const obtenirImageEvenement = (identifiant: string) => {
  //   switch (identifiant) {
  //     case 'evenement-1':
  //       return 'https://images.unsplash.com/photo-1548625361-155deee223d2?auto=format&fit=crop&q=80&w=600';
  //     case 'evenement-2':
  //       return 'https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?auto=format&fit=crop&q=80&w=600';
  //     case 'evenement-3':
  //       return 'https://images.unsplash.com/photo-1461530751191-68beaca85077?auto=format&fit=crop&q=80&w=600';
  //     case 'evenement-4':
  //       return 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600';
  //     case 'evenement-5':
  //       return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600';
  //     default:
  //       return 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=600';
  //   }
  // };

  return (
    <section id="calendrier-paroissial-screen" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      
      {/* En-tête de section */}
      <div className="space-y-4 max-w-3xl">
        <span className="font-mono text-xs uppercase tracking-widest text-[#af894d] dark:text-[#c29f63] block">
          Agenda
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900 leading-tight dark:text-slate-100">
          Calendrier des Activités
        </h1>
        <p className="text-base text-slate-600 font-light dark:text-slate-400">
          Chaque semaine, notre église s’éveille au rythme de la prière. Venez, nous vous invitons à passer un bon moment avec nous dans le seigneur.
        </p>
        {chargement && (
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Chargement des activités...
          </p>
        )}
      </div>

      {/* Boutons de Filtres d'Événements */}
      <div id="barre-boutons-filtres-evenements" className="flex flex-wrap gap-2.5 border-b border-[#f4ebd9] pb-6 dark:border-slate-800">
        {['Tous', 'Culte', 'Jeunesse', 'Prière', 'Social'].map((type) => {
          const estActif = filtreCategorie === type;
          return (
            <button
              key={type}
              id={`bouton-filtre-evenement-${type}`}
              onClick={() => definirFiltreCategorie(type)}
              className={`px-5 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                estActif
                  ? 'bg-[#af894d] text-white shadow-md dark:bg-slate-850 dark:text-slate-100'
                  : 'bg-white text-slate-300 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-800 dark:hover:bg-slate-800'
              }`}
            >
              {type === 'Tous' ? 'Tous les événements' : type}
            </button>
          );
        })}
      </div>

      {/* Grille des événements */}
      <div id="grille-liste-evenements" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {evenementsFiltrés.length > 0 ? (
          evenementsFiltrés.map((evt) => {
            const placesRestantes = evt.placesDisponibles ?? 0;
            const placesEpuisees = placesRestantes <= 0;

            return (
              <div
                key={evt.identifiant}
                id={`carte-evenement-${evt.identifiant}`}
                className="bg-white border border-[#f4ebd9]/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800"
              >
                {/* Image d'événement thématique */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={evt.imageUrl || obtenirImageEvenement(evt.identifiant)}
                    alt={evt.titre}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/15 to-transparent" />
                </div>

                {/* Contenu de l'événement */}
                <div className="p-6 sm:p-8 space-y-6">
                  
                  {/* Badge Catégorie */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-[#c29f63]/10 text-[#af894d] text-[10px] font-mono font-bold uppercase rounded dark:bg-[#c29f63]/15 dark:text-[#c29f63]">
                      {evt.categorie}
                    </span>
                    
                    {/* {placesRestantes > 0 && (
                      <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#c29f63]" /> {placesRestantes} places dispos
                      </span>
                    )} */}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {evt.titre}
                    </h3>
                    <p className="text-sm text-slate-600 font-light leading-relaxed dark:text-slate-400">
                      {evt.description}
                    </p>
                  </div>

                  {/* Datation et lieu */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-50 text-xs font-mono text-slate-600 dark:border-slate-850 dark:text-slate-450">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#af894d]" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#af894d]" />
                      <span>{evt.heure}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#af894d]" />
                      <span>{evt.lieu}</span>
                    </div>
                  </div>

                </div>

                {/* Bouton d'action */}
                <div className="px-6 pb-6 pt-2">
                  <div className="w-full py-3 rounded-md text-xs font-bold uppercase tracking-widest text-center shadow-sm bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                    {placesEpuisees ? 'Complet' : 'Activité ouverte'}
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-slate-500 font-light">
            Aucun événement de cette catégorie n'est programmé pour le moment.
          </div>
        )}
      </div>

      {/* Système d'assistance et d'accueil aux nouveaux */}
      <div id="bloc-assistance-nouveaux" className="bg-[#fbf9f4] border border-[#f4ebd9] p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 dark:bg-slate-900/40 dark:border-slate-800">
        <div className="space-y-2 text-left md:max-w-xl">
          <h3 className="font-serif text-xl font-bold text-[#af894d]">
            Vous venez pour la toute première fois ?
          </h3>
          <p className="text-sm text-slate-600 font-light leading-relaxed dark:text-slate-400">
            N’ayez aucune inquiétude : nos bénévoles de l'équipe d'accueil (protocoles) se feront une joie de vous escorter depuis l'arrêt jusqu'à l'entrée de l'église, de vous présenter le déroulement des activités. appelez le +243 822 342 445 pour plus de précisions.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[#af894d] text-xs uppercase font-mono tracking-widest font-bold">
          <Bell className="w-4 h-4 animate-bounce" /> Soyez le(la) bienvenu(e) !
        </div>
      </div>

    </section>
  );
}
