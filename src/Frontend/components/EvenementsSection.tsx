/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, SyntheticEvent } from 'react';
import { Calendar, MapPin, Clock, Users, Check, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EVENEMENTS_DONNEES } from '../data';
import { Evenement } from '../types';

export default function EvenementsSection() {
  const [evenements, definirEvenements] = useState<Evenement[]>(EVENEMENTS_DONNEES);
  const [filtreCategorie, definirFiltreCategorie] = useState<string>('Tous');
  
  // États d'inscription modale
  const [evenementAInscrire, definirEvenementAInscrire] = useState<Evenement | null>(null);
  const [nomDonneur, definirNomDonneur] = useState<string>('');
  const [courrielDonneur, definirCourrielDonneur] = useState<string>('');
  const [placesReservees, definirPlacesReservees] = useState<number>(1);
  const [inscriptionTerminee, definirInscriptionTerminee] = useState<boolean>(false);

  const evenementsFiltrés = evenements.filter((evt) => {
    return filtreCategorie === 'Tous' || evt.categorie === filtreCategorie;
  });

  const obtenirImageEvenement = (identifiant: string) => {
    switch (identifiant) {
      case 'evenement-1':
        return 'https://images.unsplash.com/photo-1548625361-155deee223d2?auto=format&fit=crop&q=80&w=600';
      case 'evenement-2':
        return 'https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?auto=format&fit=crop&q=80&w=600';
      case 'evenement-3':
        return 'https://images.unsplash.com/photo-1461530751191-68beaca85077?auto=format&fit=crop&q=80&w=600';
      case 'evenement-4':
        return 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600';
      case 'evenement-5':
        return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600';
      default:
        return 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=600';
    }
  };

  const soumettreFormulaireInscription = (evenement: SyntheticEvent) => {
    evenement.preventDefault();
    if (!nomDonneur.trim() || !courrielDonneur.trim()) return;

    // Diminuer le nombre de places disponibles simulées
    if (evenementAInscrire) {
      definirEvenements((prevEvts) =>
        prevEvts.map((e) => {
          if (e.identifiant === evenementAInscrire.identifiant && e.placesDisponibles) {
            return {
              ...e,
              placesDisponibles: Math.max(0, e.placesDisponibles - placesReservees),
            };
          }
          return e;
        })
      );
    }

    definirInscriptionTerminee(true);
    setTimeout(() => {
      // Reinitialiser
      definirNomDonneur('');
      definirCourrielDonneur('');
      definirPlacesReservees(1);
      definirInscriptionTerminee(false);
      definirEvenementAInscrire(null);
    }, 4000);
  };

  return (
    <section id="calendrier-paroissial-screen" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      
      {/* En-tête de section */}
      <div className="space-y-4 max-w-3xl">
        <span className="font-mono text-xs uppercase tracking-widest text-[#af894d] dark:text-[#c29f63] block">
          Agenda
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900 leading-tight dark:text-slate-100">
          Calendrier des Activités écclésiastiques
        </h1>
        <p className="text-base text-slate-600 font-light dark:text-slate-400">
          Chaque semaine, notre église s’éveille au rythme de la prière. Venez, nous vous invitons à passer un bon moment avec nous dans le seigneur.
        </p>
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
                  ? 'bg-slate-900 text-white shadow-md dark:bg-slate-850 dark:text-slate-100'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-800 dark:hover:bg-slate-800'
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
                    src={obtenirImageEvenement(evt.identifiant)}
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
                  <button id={`bouton-inscription-evt-${evt.identifiant}`} onClick={() => definirEvenementAInscrire(evt)} disabled={placesEpuisees} className={`w-full py-3 rounded-md text-xs font-bold uppercase tracking-widest text-center shadow-sm transition-all cursor-pointer ${placesEpuisees? 'bg-slate-105 text-slate-400 border border-slate-150 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600 dark:border-slate-850': 'bg-[#af894d] text-white hover:bg-[#936f3c]'}`}>
                    {placesEpuisees ? 'Complet' : 'Prendre part'}
                  </button>
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
            N’ayez aucune inquiétude : nos bénévoles de l'équipe d'accueil (protocoles) se feront une joie de vous escorter depuis l'arrêt jusqu'à l'entrée de l'église, de vous présenter le déroulement des activités.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[#af894d] text-xs uppercase font-mono tracking-widest font-bold">
          <Bell className="w-4 h-4 animate-bounce" /> Soyez le(la) bienvenu(e) !
        </div>
      </div>

      {/* Modale d'inscription aux événements avec animations */}
      <AnimatePresence>
        {evenementAInscrire && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Arrière-plan transparent sombre */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950 cursor-pointer" onClick={() => definirEvenementAInscrire(null)}/>

            {/* Corps de la Modale */}
            <motion.div id="corps-modale-inscription" initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 30 }} className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-800 z-10 dark:bg-slate-900 dark:text-slate-100">
              {/* Bouton Fermeture */}
              <button id="bouton-ferme-modale" onClick={() => definirEvenementAInscrire(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer dark:hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 text-left">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#c29f63]">
                  Réservation
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-tight">
                  {evenementAInscrire.titre}
                </h3>
                <p className="text-xs text-slate-500 font-mono italic">
                  Prévu le {evenementAInscrire.date} à {evenementAInscrire.heure}
                </p>
              </div>

              {!inscriptionTerminee ? (
                <form id="formulaire-inscription-evenement" onSubmit={soumettreFormulaireInscription} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="nom-complet" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Votre Nom Complet
                    </label>
                    <input type="text" id="nom-complet" required placeholder="Jean Ilunga" value={nomDonneur} onChange={(e) => definirNomDonneur(e.target.value)} className="w-full px-4 py-3 text-sm rounded bg-slate-50 border border-slate-200 outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] dark:bg-slate-800 dark:border-slate-800 dark:text-slate-100"/>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label htmlFor="champ-email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Adresse éléctronique
                    </label>
                    <input type="email" id="champ-email" required placeholder="jeanilunga@gmail.com" value={courrielDonneur} onChange={(e) => definirCourrielDonneur(e.target.value)} className="w-full px-4 py-3 text-sm rounded bg-slate-50 border border-slate-200 outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] dark:bg-slate-800 dark:border-slate-800 dark:text-slate-100"/>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label htmlFor="nombre-places" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Nombre de Personnes
                    </label>
                    <select id="nombre-places" value={placesReservees} onChange={(e) => definirPlacesReservees(Number(e.target.value))} className="w-full px-4 py-3 text-sm rounded bg-slate-50 border border-slate-200 outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] dark:bg-slate-800 dark:border-slate-800 dark:text-slate-100">
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <option key={idx} value={idx}>
                          {idx} {idx > 1 ? 'personnes' : 'personne'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-3">
                    <button type="submit" id="bouton-valider-inscription-form" className="w-full py-3.5 bg-[#af894d] hover:bg-[#936f3c] text-white font-bold text-xs uppercase tracking-widest rounded-md cursor-pointer transition-all">
                      Confirmer ma présence
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div id="boite-inscription-terminee" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center space-y-4">
                  <div className="p-4 bg-emerald-50 text-emerald-500 rounded-full w-fit mx-auto dark:bg-emerald-950/40 dark:text-emerald-400">
                    <Check className="w-10 h-10" />
                  </div>
                  <h4 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Inscription confirmée !
                  </h4>
                  <p className="text-sm text-slate-500 font-light dark:text-slate-400 max-w-sm mx-auto">
                    Merci <span className="font-semibold text-slate-800 dark:text-slate-100">{nomDonneur}</span>. Un ticket d'accès a été envoyé à <span className="font-mono text-slate-700 dark:text-slate-305">{courrielDonneur}</span>. À très bientôt !
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}