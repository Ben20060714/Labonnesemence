/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sun, Moon, Church, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';

interface EnTeteProps {
  pageActive: string;
  definirPageActive: (page: string) => void;
  modeSombre: boolean;
  alternerTheme: () => void;
}

export default function EnTete({
  pageActive,
  definirPageActive,
  modeSombre,
  alternerTheme,
}: EnTeteProps) {
  const [menuMobileOuvert, definirMenuMobileOuvert] = useState<boolean>(false);

  const ongletsNavigation = [
    { cle: 'accueil', libelle: 'Accueil' },
    { cle: 'sermons', libelle: 'Sermons & Enseignements' },
    { cle: 'evenements', libelle: 'Calendrier Paroissial' },
    { cle: 'communaute', libelle: 'Qui sommes-nous ?' },
    { cle: 'contact-dons', libelle: 'Contact & Dons' },
  ];

  const executerChangementPage = (clePage: string) => {
    definirPageActive(clePage);
    definirMenuMobileOuvert(false);
  };

  return (
    <header
      id="barre-navigation-principale"
      className="sticky top-0 z-50 w-full border-b backdrop-blur-md bg-white/90 border-[#f4ebd9] text-slate-800 transition-colors duration-300 dark:bg-slate-900/95 dark:border-slate-800 dark:text-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            id="bloc-logo-paroisse"
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => executerChangementPage('accueil')}
          >
            <div className="p-2 duration-300 bg-[#c29f63]/10 text-[#c29f63] rounded-full hover:bg-[#c29f63]/20 dark:bg-[#c29f63]/20 dark:text-[#c29f63]">
              <Church className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg tracking-wider font-semibold text-[#af894d] dark:text-[#c29f63]">
                La bonne semence
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 dark:text-slate-500">
                30ème C.P.CO
              </span>
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav id="navigation-grand-ecran" className="hidden md:flex items-center gap-1">
            {ongletsNavigation.map((onglet) => {
              const estActif = pageActive === onglet.cle;
              return (
                <button
                  key={onglet.cle}
                  id={`onglet-desktop-${onglet.cle}`}
                  onClick={() => executerChangementPage(onglet.cle)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                    estActif
                      ? 'text-[#af894d] dark:text-[#c3a064]'
                      : 'text-slate-600 hover:text-[#af894d] dark:text-slate-300 dark:hover:text-[#c3a064]'
                  }`}
                >
                  {onglet.libelle}
                  {estActif && (
                    <motion.div
                      layoutId="soulignement-navigation"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#af894d] dark:bg-[#c3a064]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions à Droite */}
          <div className="hidden md:flex items-center gap-4">
            {/* Bouton Theme */}
            <button
              id="bouton-alterner-theme-desktop"
              onClick={alternerTheme}
              className="p-2.5 rounded-full border border-slate-200 text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-amber-400"
              title={modeSombre ? 'Activer le mode clair' : 'Activer le mode sombre'}
            >
              {modeSombre ? <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Bouton Faire un Don Rapide */}
            <button
              id="bouton-don-rapide"
              onClick={() => executerChangementPage('contact-dons')}
              className="px-5 py-2.5 rounded-md text-xs font-semibold tracking-wider uppercase text-white bg-gradient-to-r from-[#af894d] to-[#c29f63] shadow-md hover:shadow-lg hover:from-[#936f3c] hover:to-[#af894d] active:scale-95 transition-all duration-150 cursor-pointer"
            >
              Faire un Don
            </button>
          </div>

          {/* Bouton Menu Mobile */}
          <div className="md:hidden flex items-center gap-3">
            <button
              id="bouton-theme-mobile"
              onClick={alternerTheme}
              className="p-2 rounded-full border border-slate-200 text-slate-500 cursor-pointer dark:border-slate-800 dark:text-slate-400"
            >
              {modeSombre ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              id="bouton-burger-mobile"
              onClick={() => definirMenuMobileOuvert(!menuMobileOuvert)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {menuMobileOuvert ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Déroulant */}
      {menuMobileOuvert && (
        <motion.div
          id="conteneur-menu-mobile"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-[#f4ebd9] bg-white text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
        >
          <div className="px-3 py-4 space-y-1.5">
            {ongletsNavigation.map((onglet) => {
              const estActif = pageActive === onglet.cle;
              return (
                <button
                  key={onglet.cle}
                  id={`onglet-mobile-${onglet.cle}`}
                  onClick={() => executerChangementPage(onglet.cle)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    estActif
                      ? 'bg-[#c29f63]/10 text-[#af894d] dark:bg-[#c29f63]/25 dark:text-[#c3a064]'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {onglet.libelle}
                </button>
              );
            })}
            <div className="pt-3 px-4 border-t border-[#f4ebd9]/60 dark:border-slate-800">
              <button
                id="bouton-faire-don-mobile"
                onClick={() => executerChangementPage('contact-dons')}
                className="w-full py-3 rounded-md text-xs font-bold uppercase tracking-wider text-center text-white bg-[#af894d] hover:bg-[#936f3c] cursor-pointer"
              >
                Soutenir l'église (Don)
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
