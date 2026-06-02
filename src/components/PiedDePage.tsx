/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, SyntheticEvent } from 'react';
import { Church, Mail, MapPin, Phone, Send, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface PiedDePageProps {
  definirPageActive: (page: string) => void;
}

export default function PiedDePage({ definirPageActive }: PiedDePageProps) {
  const [courrielNewsletter, definirCourrielNewsletter] = useState<string>('');
  const [statutInscription, definirStatutInscription] = useState<boolean>(false);

  const gererInscriptionNewsletter = (evenement: SyntheticEvent) => {
    evenement.preventDefault();
    if (!courrielNewsletter.trim()) return;
    
    // Simulation success
    definirStatutInscription(true);
    setTimeout(() => {
      definirCourrielNewsletter('');
      definirStatutInscription(false);
    }, 4000);
  };

  return (
    <footer id="pied-de-page-principal" className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors duration-300 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Bloc Église / Présentation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#c29f63]/20 text-[#c29f63] rounded-full">
                <Church className="w-5 h-5" />
              </div>
              <span className="font-serif text-xl tracking-wider font-semibold text-[#c29f63]">
                La Bonne semence
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ab similique voluptatum nobis. Consectetur eaque, autem assumenda illo doloremque fuga distinctio tenetur eius ipsam eum debitis deserunt omnis velit. Autem, et?.
            </p>
            <div className="text-xs text-slate-500 font-mono">
              © {new Date().getFullYear()} La bonne semence.
            </div>
          </div>

          {/* Horaires des cultes */}
          <div className="space-y-4">
            <h3 className="font-serif text-md tracking-wider font-medium text-slate-100 uppercase border-b border-[#c29f63]/30 pb-2">
              Horaires des cultes
            </h3>
            <ul className="space-y-2 text-sm text-slate-400 font-light">
              {/* <li className="flex justify-between">
                <span>Samedi :</span>
                <span className="font-mono text-slate-300">10h00</span>
              </li> */}
              <li className="flex justify-between">
                <span>Dimanche :</span>
                <span className="font-mono text-[#c29f63] font-medium">8h30 - 12h00</span>
              </li>
              <li className="flex justify-between">
                <span>Mardi & Mercredi :</span>
                <span className="font-mono text-slate-300">16h00 - 18h00</span>
              </li>
              <li className="flex justify-between">
                <span>Vendredi :</span>
                <span className="font-mono text-slate-300">14h00 - 18h00</span>
              </li>
            </ul>
          </div>

          {/* Contact Rapide */}
          <div className="space-y-4">
            <h3 className="font-serif text-md tracking-wider font-medium text-slate-100 uppercase border-b border-[#c29f63]/30 pb-2">
              Nous Situer
            </h3>
            <ul className="space-y-3 text-sm text-slate-400 font-light">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-[#c29f63]" />
                <span>7878 boulevard Kilwa, Golf Lido, Lubumbashi</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#c29f63]" />
                <span className="font-mono">+243 822 342 445</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#c29f63]" />
                <span className="font-mono text-xs">bonnesemence.cabsc@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Lettre d'information Paroissiale */}
          <div className="space-y-4">
            <h3 className="font-serif text-md tracking-wider font-medium text-slate-100 uppercase border-b border-[#c29f63]/30 pb-2">
              S'informer (Lettre)
            </h3>
            <p className="text-sm text-slate-400 font-light">
              Recevez les messages bibliques du dimanche et l'agenda des activités directement dans votre boîte mail.
            </p>
            <form
              id="formulaire-newsletter-pied-de-page"
              onSubmit={gererInscriptionNewsletter}
              className="relative mt-2"
            >
              <div className="relative flex items-center">
                <input
                  type="email"
                  id="champ-courriel-newsletter"
                  placeholder="votre.email@reseau.com"
                  value={courrielNewsletter}
                  onChange={(e) => definirCourrielNewsletter(e.target.value)}
                  className="w-full px-4 py-2.5 pr-12 text-xs rounded-md bg-slate-800 text-slate-100 border border-slate-700 outline-none focus:border-[#c29f63] focus:ring-1 focus:ring-[#c29f63] transition-all"
                  required
                />
                <button
                  type="submit"
                  id="bouton-soumettre-newsletter"
                  className="absolute right-1 p-1.5 text-slate-300 bg-[#af894d] hover:bg-[#c29f63] rounded transition-all cursor-pointer"
                >
                  {statutInscription ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {statutInscription && (
                // <motion.p
                //   id="message-succes-newsletter"
                //   initial={{ opacity: 0, y: 5 }}
                //   animate={{ opacity: 1, y: 0 }}
                //   className="text-[11px] text-emerald-400 font-medium mt-1.5 flex items-center gap-1">
                //   <Check className="w-3 h-3" /> Fonctionnalité en cours de développement...
                // </motion.p>
                <motion.p
                  id="message-succes-newsletter"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-red-500 font-medium mt-1.5 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Fonctionnalité en cours de développement...
                </motion.p>
              )}
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-4 text-xs font-light text-slate-500">
            <button onClick={() => definirPageActive('communaute')} className="hover:text-slate-300 cursor-pointer">Nos valeurs</button>
            <button onClick={() => definirPageActive('sermons')} className="hover:text-slate-300 cursor-pointer">Messages récents</button>
            <button onClick={() => definirPageActive('evenements')} className="hover:text-slate-300 cursor-pointer">Calendrier</button>
          </div>
          <span className="text-[11px] font-mono text-slate-600">
            Eglise La bonne semence — 30ème communauté pentecôtiste au congo
          </span>
        </div>
      </div>
    </footer>
  );
}
