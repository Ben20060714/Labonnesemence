/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { ShieldCheck, History, X, Mail, Phone, Award, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MembreEquipe, DevEquipe } from '../types';
import { api, calculerInitiales, obtenirUrlFichier } from '../services/api';

const DEVELOPPEUR: DevEquipe[] = [
  {
    identifiant: 'Dev-1',
    initiales: 'BM',
    nom: 'Benjamin Mwaku',
    role: 'Developpeur Front-End',
    telephone: '+243 82 043 3981',
    email: 'Benkailazad8@gmail.com',
    description: 'Je suis developpeur web FrontEnd mais aussi passionne par la securite informatique.',
    accomplissement: 'Ben20060714.github.io/UP-Dealzone, Ben20060714.github.io/Benjamin-Mwaku'
  },
  {
    identifiant: 'Dev-2',
    initiales: 'DB',
    nom: 'Djeef Bulabula',
    role: 'Developpeur web',
    telephone: '+243 830 888 983',
    email: 'Djeefjason@gmail.com',
    description: 'Je suis disponible pour apprendre avec vous.',
    accomplissement: 'En cours'
  },
  {
    identifiant: 'Dev-3',
    initiales: 'AK',
    nom: 'Aurelio Kitenge',
    role: 'Developpeur Back-End',
    telephone: '+243 851750631',
    email: 'Aureliokitenge@gmail.com',
    description: 'Dev junior specialise en web et IoT',
    accomplissement: 'Backend de l\'app Afrique Demain'
  }
];

export default function AProposSection() {
  const [membresEquipe, definirMembresEquipe] = useState<MembreEquipe[]>([]);
  const [membreSelectionne, definirMembreSelectionne] = useState<MembreEquipe | null>(null);
  const [devSelectionne, definirDevSelectionne] = useState<DevEquipe | null>(null);
  const [imageHistorique, definirImageHistorique] = useState<string>('/img/MM_5.jpg');
  const [imagePatri, definirImagePatri] = useState<string>('/img/MM_6.jpg');
  const [imagePstEtGinane, definirImagePstEtGinane] = useState<string>('/img/MM_3.jpg');

  useEffect(() => {
    let composantActif = true;

    Promise.all([api.listerMembresPublics(), api.listerFichiersPublics('cover').catch(() => [])])
      .then(([membres, fichiersBase]) => {
        if (composantActif) definirMembresEquipe(membres);

        const imageHistoriqueBase = fichiersBase.find((fichier) => {
          const categorie = (fichier.categorie || '').toLowerCase();
          return fichier.mimetype.startsWith('image/') && (categorie.includes('histor') || categorie.includes('memoire'));
        });

        if (composantActif && imageHistoriqueBase) {
          definirImageHistorique(obtenirUrlFichier(imageHistoriqueBase.id));
        }
      })
      .catch((erreur) => {
        console.error('Chargement de l equipe depuis API impossible:', erreur);
      });

    return () => {
      composantActif = false;
    };
  }, []);

  const formaterNomComplet = (membre: Pick<MembreEquipe, 'prenom' | 'nom'>) => {
    return [membre.prenom, membre.nom].filter(Boolean).join(' ').trim() || 'Membre';
  };

  // Afficher uniquement le corps pastoral (Pasteur, Représentant, Anciens, Diacres)
  const rolesAutorises = ['pasteur', 'représentant', 'representant', 'ancien', 'anciens', 'diacre', 'diacres'];
  const corpsPastoral = membresEquipe.filter((m) => {
    const r = (m.role || '').toLowerCase();
    return rolesAutorises.some((autorise) => r.includes(autorise));
  });

  const croyancesFondatrices = [
    {
      titre: 'Le mystère de l\'église',
      description: 'Aimer Dieu ainsi que son prochain est la source et le sommet de toute la vie chrétienne.'
    },
    {
      titre: 'La consolation et la compassion',
      description: 'Soutenir mutuellement les familles dans l’affliction, la solitude ou la détresse financière.'
    },
    {
      titre: 'L\'accompagnement des enfants',
      description: 'Être là et accompagner tous les enfants dans leur marche sur le chemin de la foi et les soutenir à chaque moment.'
    },
    {
      titre: 'L’Engagement',
      description: 'La foi s’exprime concrètement par les œuvres d’amour fraternel. Nous militons pour le développement de l’entraide mutuelle.'
    }
  ];

  const extensionsCommunautaies = [
    { nom: 'BONNE SEMENCE', temple: 'TEMPLE DE GLOIRE', lieu: 'GOLF LIDO LUBUMBASHI', pasteur: 'PST DJOE' },
    { nom: 'BONNE SEMENCE', temple: 'PAROLE DE VIE', lieu: 'GOLF METEO', pasteur: 'PST JEAN JACQUES' },
    { nom: 'BONNE SEMENCE', temple: 'PAIN DE VIE', lieu: 'GOLD FAUSTIN', pasteur: 'PST NGONGO' },
    { nom: 'BONNE SEMENCE', temple: 'CITÉ D\'ESPÉRANCE', lieu: 'KATUBA', pasteur: 'PST BARTHÉLÉMY' },
    { nom: 'BONNE SEMENCE KOLWEZI', temple: '', lieu: '', pasteur: 'PST BOBO' },
    { nom: 'BONNE SEMENCE', temple: 'TORRENT DE VIE', lieu: '', pasteur: 'PST PAUL' },
    { nom: 'BONNE SEMENCE KASUMBALESSA', temple: '', lieu: '', pasteur: 'PST JOSÉ' }
  ];

  return (
    <section id="qui-sommes-nous-screen" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-20">

      {/* 1. Notre Histoire et Vision */}
      <div className="items-center">

        <div className="lg:col-span-7 space-y-6 text-left">
          <span className="font-mono text-xs uppercase tracking-widest text-[#af894d] dark:text-[#c29f63] block">
            Héritage et Intégration
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900 leading-tight dark:text-slate-100">
            Une église, Un seul corps : le Christ.
          </h1>
          <div className="w-20 h-0.5 bg-[#af894d]" />

          <div className="flex flex-col space-y-4 text-sm sm:text-base text-slate-600 font-light leading-relaxed dark:text-slate-400">
            <div>
              <h2 className="text-2xl font-bold">INTRODUCTION</h2>
              <p>
                LA BONNE SEMENCE est cette église qui a vu le jour en 1992 avec son grand visionnaire, <strong>le patriarche Jean Médard Kalonda Bin Baruani</strong>.
              </p>
              <p>
                LA BONNE SEMENCE croit et enseigne que Jesus-christ est le seul Sauveur et Seigneur du monde.
              </p>
              <p>
                Jean 3 : 16 « Car Dieu a tant aimé le monde qu'il a donné son fils unique afin que quiconque croit en lui ne périsse point mais qu'il ait la vie éternelle. »<br />
                Le salut des âmes est le premier objectif que poursuit LA BONNE SEMENCE.
              </p>
              <p>
                Matthieu 28 : 19 « Allez, faites de toutes les nations des disciples les baptisants au nom du Père, du Fils et du Saint-Esprit. »<br />
                Nous croyons en un seul et unique vrai Dieu qui s'est révélé sous trois dimensions.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold">LE PATRIARCHE JEAN MEDARD</h2>
              <p>Le patriarche Jean Médard Bin Baruani est un ancien musulman.<br />
                Après avoir renoncé à l'islam en 1980, il crut à l'évangile du pasteur Jean Momu. Sous la conduite de ce dernier, le patriarche devient un grand sauveur d'âmes ainsi que le président du département de l'évangelisation à l'église viens et vois.
              </p>
              <p>
                En 1992, il reçut la vision de bâtir trois édifices pour le seigneur, d'où la naissance de l'église LA BONNE SEMENCE.
              </p>
              <p>
                En 2015 débuta la grande vision de la naissance de la communauté des assemblées Bonne Semence, CABSC.
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">QUI CONDUIT ET DIRIGE LA BONNE SEMENCE ACTUELLEMENT ?</h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
                <div className="space-y-3 text-sm sm:text-base">
                  <p>
                    Depuis la mort de son Bishop en Septembre 2020, LA BONNE SEMENCE est dirigée par le Pasteur Djoe Baruani, fils biologique du Pasteur Jean Médard.
                  </p>
                  <p><i>Le pasteur Djoe Baruani est pere de trois enfants et marie a madame Ginane Baruani.</i></p>
                  <p>Après avoir vécu plus de vingt ans en Europe, le Pasteur Djoe Baruani a accepté l'appel de Dieu d'une manière inconditionnelle étant l'ami du Saint-Esprit.</p>
                  <p>Le pasteur Djoe voit dans son ministère l'accomplissement des promesses bibliques écrites dans <strong>Marc 16 : 17 - 18</strong></p>
                  <p className="font-bold"><i>« Voici les miracles qui accompagneront ceux qui auront cru : en mon nom, ils chasseront les demons ; ils parleront de nouvelles langues ; ils saisiront des serpents ; s'ils boivent quelque breuvage mortel, il ne leur fera point de mal ; ils imposeront les mains auxmalades, et les malades seront guéris. »</i></p>
                </div>
                <div className="overflow-hidden rounded-3xl bg-slate-50 shadow-sm dark:bg-slate-900/70">
                  <img src={imagePstEtGinane} alt="Pst. Djoe et Ginane" className="h-[520px] w-full rounded-[1.1rem] object-center" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">LA SUCCESSION</h2>
                <p>Un succès sans successeur ne sera jamais considéré comme un véritable succès.</p>
                <p>En l'an 2000, une succession se préparait déjà selon le plan divin de Dieu. Sur cette photo, nous voyons le Patriarche Jean Medard Kalonda Bin Baruani et son fils biologique Jean Djoe Kalonda Bin Baruani.</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div className="overflow-hidden rounded-3xl bg-slate-50 shadow-sm dark:bg-slate-900/70">
                  <img src={imagePatri} alt="Le patriarche Jean-médard et son fils" className="h-[300px] w-full rounded-[1.1rem] object-cover object-center" />
                </div>
                <div className="rounded-2xl border border-[#f4ebd9]/40 bg-white/70 p-5 shadow-sm dark:bg-slate-900/60">
                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    Cette image rappelle l’héritage spirituel transmis de génération en génération, avec une continuité forte dans la vision et l’engagement pour l’église.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-[#fcfaf5] to-[#f8f1e1] p-6 shadow-sm dark:from-slate-900/80 dark:to-slate-900/60">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">LA COMMUNAUTÉ DES ASSEMBLÉES BONNE SEMENCE</h2>
                  <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    La communauté des assemblées Bonne Semence s’étend à plusieurs endroits au Congo avec des centres d’accueil, de prédication et d’encadrement spirituel.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {extensionsCommunautaies.map((extension, index) => (
                    <div key={index} className="rounded-2xl border border-[#e7d4b0]/70 bg-white/90 p-4 shadow-xs dark:bg-slate-900/70">
                      <p className="text-[11px] uppercase tracking-[0.25em] text-[#af894d] dark:text-[#c29f63]">Extension {index + 1}</p>
                      <div className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        <p className="font-semibold uppercase">{extension.nom}</p>
                        {extension.temple ? <p>{extension.temple}</p> : null}
                        {extension.lieu ? <p>{extension.lieu}</p> : null}
                        <p className="font-medium text-slate-800 dark:text-slate-200">{extension.pasteur}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>       

      </div>

      {/* 2. Ce en quoi nous croyons */}
      <div id="bloc-valeurs-credo" className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-[#af894d] dark:text-[#c29f63]">
            Notre Église
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-100">
            LA BONNE SEMENCE S’ancre sur Quatre bases
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
        {/* Bloc graphique de la vision (Stained Glass Photo with Overlay) */}
        <div className="lg:col-span-5 relative h-[360px] rounded-2xl overflow-hidden bg-slate-950 p-6 flex flex-col justify-end text-white border border-[#c29f63]/30">

          {/* Image de fond : Vitrail d'église */}
          <div className="absolute inset-0 z-0">
            <img src={imageHistorique} alt="Photo ancienne de l'église" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-slate-950/40" />
          </div>

          <div className="absolute top-0 right-0 p-6">
            <History className="w-10 h-10 text-[#c29f63]/80" />
          </div>

          <div className="relative space-y-3 z-10 text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#c29f63] font-bold">
              Objectif de l'église
            </span>
            <blockquote className="font-serif text-lg italic text-[#e7d4b0]">
              « Car Dieu a tant aimé le monde qu'il a donné son fils unique afin que quiconque croit en lui ne périsse point mais qu'il ait la vie éternelle. »
            </blockquote>
            <p className="text-[11px] font-mono text-slate-400">
              — Jean 3 : 16
            </p>
          </div>

        </div>
      </div>

      {/* 3. L'Équipe d'Animation Pastorale */}
      <div id="bloc-clerge-communaute" className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-[#af894d] dark:text-[#c29f63]">
            Vos Serviteurs
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-100">
            L'Équipe
          </h2>
          <p className="text-sm text-slate-500 font-light dark:text-slate-400">
            Pasteur, anciens, diacres et choristes.
          </p>
          <div className="w-16 h-0.5 bg-[#af894d] mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {corpsPastoral.map((membre) => (
            <motion.div key={membre.identifiant} id={`carte-paroisse-membre-${membre.identifiant}`} layoutId={`contenant-membre-${membre.identifiant}`} onClick={() => definirMembreSelectionne(membre)} className="bg-white border border-[#f4ebd9]/60 rounded-xl p-6 text-center space-y-4 hover:shadow-md hover:border-[#af894d] transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-800">
              <div className="w-20 h-20 bg-gradient-to-br from-[#af894d] to-[#e7d4b0] rounded-full mx-auto flex items-center justify-center text-white text-2xl font-serif font-bold shadow-sm overflow-hidden">
                {membre.imageUrl ? (
                  <img src={membre.imageUrl} alt={formaterNomComplet(membre)} className="w-full h-full object-cover" />
                ) : (
                  calculerInitiales(membre.prenom, membre.nom)
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formaterNomComplet(membre)}
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
        {corpsPastoral.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500 border border-dashed border-[#f4ebd9] rounded-xl dark:border-slate-800">
            Aucun membre pastoral n'est encore enregistré en base.
          </div>
        )}
      </div>

      {/* Modale de description du membre (Pastoral Detail sheet) */}
      <AnimatePresence>
        {membreSelectionne && (
          <div className="fixed inset-0 z-50 flex items-center h-screen justify-center p-4">
            {/* Overlay transparent de fermeture */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950 cursor-pointer" onClick={() => definirMembreSelectionne(null)} />

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
                <div className="w-24 h-24 bg-gradient-to-tr from-[#af894d]/20 to-[#c29f63]/25 border-2 border-[#af894d] rounded-full mx-auto flex items-center justify-center text-[#af894d] text-3xl font-serif font-bold dark:text-[#c29f63] overflow-hidden">
                  {membreSelectionne.imageUrl ? (
                    <img src={membreSelectionne.imageUrl} alt={formaterNomComplet(membreSelectionne)} className="w-full h-full object-cover" />
                  ) : (
                    calculerInitiales(membreSelectionne.prenom, membreSelectionne.nom)
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif text-2xl font-bold">
                    {formaterNomComplet(membreSelectionne)}
                  </h4>
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#c29f63]">
                    {membreSelectionne.role}
                  </p>
                </div>
              </div>

              {/* Biographie complète */}
              <div className="space-y-4 border-t border-slate-50 pt-5 text-sm font-light text-slate-600 leading-relaxed dark:text-slate-400 dark:border-slate-850">
                <p>{membreSelectionne.biographie}</p>

                <p className="text-xs italic bg-[#fcfaf4] p-3 border border-[#f4ebd9]/60 rounded dark:bg-slate-800/50 dark:border-slate-800">
                  « Être au service de Dieu me remplit chaque jour de joie et me donne l'opportunité de témoigner de l'amour divin auprès de vous tous. »
                </p>
              </div>

              {/* Contacts de service */}
              <div className="space-y-3 text-xs font-mono text-slate-500 pt-4 dark:text-slate-450 border-t border-slate-50 dark:border-slate-850">
                {membreSelectionne.email && (
                  <a href={`mailto:${membreSelectionne.email}`} className="flex items-center gap-2 hover:text-[#af894d] transition-colors">
                    <Mail className="w-3.5 h-3.5 text-[#af894d]" />
                    <span>{membreSelectionne.email.toLowerCase()}</span>
                  </a>
                )}
                {membreSelectionne.telephone && (
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <a href={`tel:${membreSelectionne.telephone}`} className="flex items-center gap-2 hover:text-[#af894d] transition-colors">
                      <Phone className="w-3.5 h-3.5 text-[#af894d]" />
                      <span>{membreSelectionne.telephone}</span>
                    </a>
                    <a
                      href={`https://wa.me/${membreSelectionne.telephone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-emerald-500 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-[#af894d]" />
                  <span>Membre de LA BONNE SEMENCE depuis 2020</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div id="bloc-technique-communaute" className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-[#af894d] dark:text-[#c29f63]">
            La technique
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-100">
            À propos du développeur
          </h2>
          <p className="text-sm text-slate-500 font-light dark:text-slate-400">
            Qui a développé ce site web ?
          </p>
          <div className="w-16 h-0.5 bg-[#af894d] mx-auto" />
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {DEVELOPPEUR.map((dev) => (
            <motion.div key={dev.identifiant} id={`carte-dev-${dev.identifiant}`} layoutId={`contenant-dev-${dev.identifiant}`} onClick={() => definirDevSelectionne(dev)} className="w-full sm:w-72 bg-white border border-[#f4ebd9]/60 rounded-xl p-6 text-center space-y-4 hover:shadow-md hover:border-[#af894d] transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-800">
              <div className="w-20 h-20 bg-gradient-to-br from-[#af894d] to-[#e7d4b0] rounded-full mx-auto flex items-center justify-center text-white text-2xl font-serif font-bold shadow-sm">
                {dev.initiales}
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                  {dev.nom}
                </h3>
                <p className="text-xs font-semibold text-[#c29f63] font-mono uppercase tracking-wider">
                  {dev.role}
                </p>
              </div>
              <p className="text-xs text-slate-500 font-light line-clamp-2 dark:text-slate-400 leading-relaxed">
                {dev.description}
              </p>
              <span className="inline-block text-[11px] font-bold text-slate-400 group-hover:text-slate-800 dark:text-slate-500 py-1 border-b border-transparent hover:border-[#c29f63] cursor-pointer">
                Lire la fiche complète →
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modale de description du developpeur */}
      <AnimatePresence>
        {devSelectionne && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay transparent de fermeture */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950 cursor-pointer" onClick={() => definirDevSelectionne(null)} />

            {/* Fiche des devs Popover */}
            <motion.div id="fiche-technique-dev" layoutId={`contenant-dev-${devSelectionne.identifiant}`} className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-800 z-10 dark:bg-slate-900 dark:text-slate-100">
              <button id="bouton-fermer-fiche-dev" onClick={() => definirDevSelectionne(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer dark:hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-tr from-[#af894d]/20 to-[#c29f63]/25 border-2 border-[#af894d] rounded-full mx-auto flex items-center justify-center text-[#af894d] text-3xl font-serif font-bold dark:text-[#c29f63]">
                  {devSelectionne.initiales}
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif text-2xl font-bold">
                    {devSelectionne.nom}
                  </h4>
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#c29f63]">
                    {devSelectionne.role}
                  </p>
                </div>
              </div>

              {/* Biographie complète */}
              <div className="space-y-4 border-t border-slate-50 pt-5 text-sm font-light text-slate-600 leading-relaxed dark:text-slate-400 dark:border-slate-850">
                {/* <p>{devSelectionne.description}</p> */}

                <p className=" italic bg-[#fcfaf4] p-3 border border-[#f4ebd9]/60 rounded dark:bg-slate-800/50 dark:border-slate-800">
                  {/* « Développer des outils pour la communauté est une mission qui me tient à cœur. » */}
                  {devSelectionne.description.toLowerCase()}
                </p>
              </div>

              {/* Contacts de service */}
              <div className="space-y-3 text-xs font-mono text-slate-500 pt-4 dark:text-slate-450 border-t border-slate-50 dark:border-slate-850">
                <a href={`mailto:${devSelectionne.email}`} className="flex items-center gap-2 hover:text-[#af894d] transition-colors">
                  <Mail className="w-3.5 h-3.5 text-[#af894d]" />
                  <span>{devSelectionne.email.toLowerCase()}</span>
                </a>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <a href={`tel:${devSelectionne.telephone}`} className="flex items-center gap-2 hover:text-[#af894d] transition-colors">
                    <Phone className="w-3.5 h-3.5 text-[#af894d]" />
                    <span>{devSelectionne.telephone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${devSelectionne.telephone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-emerald-500 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>WhatsApp</span>
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-[#af894d]" />
                  <span>{devSelectionne.accomplissement}</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
