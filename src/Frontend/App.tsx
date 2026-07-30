/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import EnTete from './components/En-tete.tsx';
import PiedDePage from './components/PiedDePage.tsx';
import AccueilSection from './components/AccueilSection.tsx';
import SermonsSection from './components/SermonsSection.tsx';
import EvenementsSection from './components/EvenementsSection.tsx';
import AProposSection from './components/AProposSection.tsx';
import ContactDonsSection from './components/ContactDonsSection.tsx';
import GalerieSection from './components/GalerieSection.tsx';
import AdminSection from './components/AdminSection.tsx';
import LoginSection from './components/LoginSection.tsx';
import InscriptionSection from './components/InscriptionSection.tsx';
import MonCompteSection from './components/MonCompteSection.tsx';
import PriereDuJourSection from './components/PriereDuJourSection.tsx';
import { SermonPlayerBar, SermonPlayerProvider, useSermonPlayer } from './components/SermonPlayerContext.tsx';
import {
  obtenirAccessToken,
  obtenirExpirationToken,
  obtenirUtilisateurCourant,
  rafraichirSessionAuth,
  UtilisateurAuthentifie,
} from './services/auth.ts';

export default function App() {
  return (
    <SermonPlayerProvider>
      <AppChrome />
    </SermonPlayerProvider>
  );
}

function AppChrome() {
  const [pageActive, definirPageActive] = useState<string>('accueil');
  const [utilisateur, definirUtilisateur] = useState<UtilisateurAuthentifie | null>(null);
  const margeRafraichissementMs = 60_000;
  const [modeSombre, definirModeSombre] = useState<boolean>(() => {
    // Restitution locale du theme
    if (typeof window !== 'undefined') {
      const optionEnregistree = localStorage.getItem('theme-paroissial');
      return optionEnregistree === 'sombre';
    }
    return false;
  });

  // Actionneur de changement de theme
  useEffect(() => {
    const elementRacine = window.document.documentElement;
    if (modeSombre) {
      elementRacine.classList.add('dark');
      localStorage.setItem('theme-paroissial', 'sombre');
    } else {
      elementRacine.classList.remove('dark');
      localStorage.setItem('theme-paroissial', 'clair');
    }
  }, [modeSombre]);

  // Remonter en haut de la page lors du changement de section
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pageActive]);

  useEffect(() => {
    let composantActif = true;

    obtenirUtilisateurCourant()
      .then((utilisateurServeur) => {
        if (composantActif) definirUtilisateur(utilisateurServeur);
      })
      .catch(() => {
        if (composantActif) definirUtilisateur(null);
      });

    return () => {
      composantActif = false;
    };
  }, []);

  useEffect(() => {
    if (!utilisateur) return;

    let annule = false;
    let identifiantTimeout: number | undefined;

    const planifierRafraichissement = () => {
      const token = obtenirAccessToken();
      if (!token) return;

      const expiration = obtenirExpirationToken(token);
      if (!expiration) return;

      const delai = Math.max(expiration - Date.now() - margeRafraichissementMs, 0);

      identifiantTimeout = window.setTimeout(async () => {
        const sessionRenouvelee = await rafraichirSessionAuth();
        if (annule || !sessionRenouvelee) {
          if (!annule) {
            definirUtilisateur(null);
          }
          return;
        }

        const utilisateurCourant = await obtenirUtilisateurCourant();
        if (!annule) {
          definirUtilisateur(utilisateurCourant);
        }
      }, delai);
    };

    planifierRafraichissement();

    return () => {
      annule = true;
      if (identifiantTimeout !== undefined) {
        window.clearTimeout(identifiantTimeout);
      }
    };
  }, [utilisateur]);

  const alternerTheme = () => {
    definirModeSombre(!modeSombre);
  };

  const { sermonCourant } = useSermonPlayer();

  // Sélecteur de rendu de page
  const renduSectionActive = () => {
    switch (pageActive) {
      case 'accueil':
        return <AccueilSection redirigerVersPage={definirPageActive} />;
      case 'sermons':
        return <SermonsSection />;
      case 'priere-du-jour':
        return <PriereDuJourSection />;
      case 'evenements':
        return <EvenementsSection />;
      case 'communaute':
        return <AProposSection />;
      case 'galerie':
        return <GalerieSection />;
      case 'contact-dons':
        return <ContactDonsSection />;
      case 'administration':
        if (utilisateur?.role !== 'admin') {
          return <LoginSection redirigerVersPage={definirPageActive} definirUtilisateur={definirUtilisateur} pageApresConnexion="administration"/>;
        }
        return <AdminSection/>;
      case 'login':
        if (utilisateur) {
          return <MonCompteSection utilisateurInitial={utilisateur} definirUtilisateur={definirUtilisateur} redirigerVersPage={definirPageActive} />;
        }
        return <LoginSection redirigerVersPage={definirPageActive} definirUtilisateur={definirUtilisateur} />;
      case 'inscription':
        return <InscriptionSection redirigerVersPage={definirPageActive} definirUtilisateur={definirUtilisateur} />;
      case 'mon-compte':
        return <MonCompteSection utilisateurInitial={utilisateur} definirUtilisateur={definirUtilisateur} redirigerVersPage={definirPageActive} />;
      default:
        return <AccueilSection redirigerVersPage={definirPageActive} />;
    }
  };

  return (
    <div
      id="application-globale"
      className="min-h-screen flex flex-col justify-between bg-[#fcfaf4] text-slate-850 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300"
    >
      {/* Barre de navigation / En-tête de page */}
      <EnTete pageActive={pageActive} definirPageActive={definirPageActive} modeSombre={modeSombre} alternerTheme={alternerTheme} utilisateur={utilisateur}/>

      {/* Cadre de contenu dynamique avec animations de transition */}
      <main id="contenant-principal-pages" className={`flex-grow ${sermonCourant ? 'pb-36 sm:pb-40' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pageActive}
            id={`panneau-page-${pageActive}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="w-full"
          >
            {renduSectionActive()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Pied de page informatif et d'inscription */}
      <PiedDePage definirPageActive={definirPageActive} />
      {sermonCourant && <div aria-hidden="true" className="h-32 sm:h-36"/>}
      <SermonPlayerBar />
    </div>
  );
}
