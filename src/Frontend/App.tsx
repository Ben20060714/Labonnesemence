/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import EnTete from '../components/En-tete.tsx';
import PiedDePage from '../components/PiedDePage.tsx';
import AccueilSection from '../components/AccueilSection.tsx';
import SermonsSection from '../components/SermonsSection.tsx';
import EvenementsSection from '../components/EvenementsSection.tsx';
import AProposSection from '../components/AProposSection.tsx';
import ContactDonsSection from '../components/ContactDonsSection.tsx';
import GalerieSection from '../components/GalerieSection.tsx';

export default function App() {
  const [pageActive, definirPageActive] = useState<string>('accueil');
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

  const alternerTheme = () => {
    definirModeSombre(!modeSombre);
  };

  // Sélecteur de rendu de page
  const renduSectionActive = () => {
    switch (pageActive) {
      case 'accueil':
        return <AccueilSection redirigerVersPage={definirPageActive} />;
      case 'sermons':
        return <SermonsSection />;
      case 'evenements':
        return <EvenementsSection />;
      case 'communaute':
        return <AProposSection />;
      case 'galerie':
        return <GalerieSection />;
      case 'contact-dons':
        return <ContactDonsSection />;
      default:
        return <AccueilSection redirigerVersPage={definirPageActive} />;
    }
  };

  return (
    <div
      id="application-globale"
      className="min-h-screen flex flex-col justify-between bg-white text-slate-850 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300"
    >
      {/* Barre de navigation / En-tête de page */}
      <EnTete
        pageActive={pageActive}
        definirPageActive={definirPageActive}
        modeSombre={modeSombre}
        alternerTheme={alternerTheme}
      />

      {/* Cadre de contenu dynamique avec animations de transition */}
      <main id="contenant-principal-pages" className="flex-grow">
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
    </div>
  );
}
