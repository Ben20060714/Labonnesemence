/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, Camera } from 'lucide-react';

export default function GalerieSection() {
  const [imageSelectionnee, definirImageSelectionnee] = useState<any>(null);
  const [filtreActif, definirFiltreActif] = useState('Tous');

  const photos = [
    {
      titre: '30ème Fête d’anniversaire de l’église',
      image: '../../img/MM_1.jpg',
      categorie: 'Cérémonie',
      descr: 'Les rires qui éclatent de partout, c’est ça la vie.'
    },
    {
      titre: 'Sortie avec la jeunesse JPC',
      image: '../../img/MM_2.jpg',
      categorie: 'Jeunesse',
      descr: 'Sortie avec la jeunesse de l’église en colombie : une belle journée.'
    },
    {
      titre: 'Chorales & Chants',
      image: '../../img/MM_3.jpg',
      categorie: 'Louange',
      descr: 'Les Nyimbo za Wokovu & Nyimbo za Mungu avec le Frère Patrick.'
    },
    {
      titre: 'Mouvement de charité',
      image: '../../img/MM_4.jpg',
      categorie: 'Social',
      descr: 'Déscente dans l’orphelinat Katena.'
    },
    {
      titre: 'Intérieur de l’église',
      image: '../../img/MM_5.jpg',
      categorie: 'Bâtiment',
      descr: 'Un lieu de paix et de recueillement.'
    },
    {
      titre: 'Accueil de l’église',
      image: '../../img/Hero_pic.jpg',
      categorie: 'Bâtiment',
      descr: 'Notre façade accueillante lors du culte dominical.'
    }
  ];

  const categories = ['Tous', 'Cérémonie', 'Jeunesse', 'Louange', 'Social', 'Bâtiment'];
  const photosFiltrees = photos.filter(p => filtreActif === 'Tous' || p.categorie === filtreActif);

  return (
    <section id="galerie-section-complete" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      
      <div className="space-y-4 max-w-3xl">
        <span className="font-mono text-xs uppercase tracking-widest text-[#af894d] dark:text-[#c29f63] block">
          Souvenirs
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900 leading-tight dark:text-slate-100">
          Galerie
        </h1>
        <p className="text-base text-slate-600 font-light dark:text-slate-400">
          Revivez en images les moments forts de notre église, de nos activités sociales et de nos temps de louange.
        </p>
      </div>

      {/* Filtres de catégories */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-[#f4ebd9] dark:border-slate-800">
        {categories.map((cat) => (
          <button key={cat} onClick={() => definirFiltreActif(cat)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${filtreActif === cat? 'bg-[#af894d] text-white shadow-md': 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grille de photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {photosFiltrees.map((item) => (
            <motion.div key={item.titre} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-slate-100 cursor-pointer shadow-sm hover:shadow-xl transition-all" onClick={() => definirImageSelectionnee(item)}>
              <img src={item.image} alt={item.titre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-[10px] font-mono text-[#c29f63] uppercase font-bold mb-1">{item.categorie}</span>
                <h3 className="text-white font-serif text-xl font-semibold">{item.titre}</h3>
                <div className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md rounded-full text-white">
                    <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Visionneuse (Lightbox) */}
      <AnimatePresence>
        {imageSelectionnee && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm cursor-pointer" onClick={() => definirImageSelectionnee(null)}/>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6 z-10">
              <button onClick={() => definirImageSelectionnee(null)} className="absolute top-0 right-0 p-3 text-white/70 hover:text-white transition-colors cursor-pointer">
                <X className="w-8 h-8" />
              </button>
              <div className="w-full flex-grow flex items-center justify-center overflow-hidden rounded-lg">
                <img src={imageSelectionnee.image} alt={imageSelectionnee.titre} className="max-w-full max-h-full object-contain shadow-2xl" />
              </div>
              <div className="text-center text-white space-y-2 max-w-2xl px-4 pb-4">
                <span className="text-xs font-mono text-[#c29f63] uppercase tracking-widest">{imageSelectionnee.categorie}</span>
                <h2 className="font-serif text-3xl font-bold">{imageSelectionnee.titre}</h2>
                <p className="text-sm text-slate-300 font-light">{imageSelectionnee.descr}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {photosFiltrees.length === 0 && (
        <div className="py-20 text-center space-y-4">
           <Camera className="w-12 h-12 text-slate-300 mx-auto" />
           <p className="text-slate-500 font-light italic">Aucune photo trouvée dans cette catégorie.</p>
        </div>
      )}
    </section>
  );
}