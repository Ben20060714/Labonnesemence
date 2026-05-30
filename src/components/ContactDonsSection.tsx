/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, SyntheticEvent } from 'react';
import { Mail, MessageSquare, ShieldCheck, Heart, User, Check, Send, Award, Compass, CreditCard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ContactDonsSection() {
  // États Formulaire Contact
  const [nomContact, definirNomContact] = useState<string>('');
  const [emailContact, definirEmailContact] = useState<string>('');
  const [sujetContact, definirSujetContact] = useState<string>('');
  const [contenuContact, definirContenuContact] = useState<string>('');
  const [notificationContactEnvoye, definirNotificationContactEnvoye] = useState<boolean>(false);

  // États Section Dons
  const [montantDon, definirMontantDon] = useState<number>(50);
  const [etapeDonation, definirEtapeDonation] = useState<number>(0); // 0: choix, 1: transaction, 2: merci
  const [donateurNom, definirDonateurNom] = useState<string>('');
  const [donateurEmail, definirDonateurEmail] = useState<string>('');
  const [donNumeroCarte, definirDonNumeroCarte] = useState<string>('');

  const montantsPredefinis = [15, 30, 50, 100, 250, 500];

  const determinerImpactDon = (somme: number): string => {
    if (somme <= 20) {
      return 'Peut contribuer à l’achat d’ornements de l’église et des besoins de l’école de dimanche.';
    } else if (somme <= 40) {
      return 'Peut financer du matériel créatif pour les enfants de l’école de dimanche.';
    } else if (somme <= 75) {
      return 'Peut financer les vivres distribués lors de nos visites aux démunis mais aussi booster la structure de l’église.';
    } else if (somme <= 250) {
      return 'Peut soutenir activement les commités de l’église et le financement des sorties culturelles ou de détente.';
    } else {
      return 'Contribue directement aux réparations de notre église et à l’entretien technique des autres secteurs défectueux.';
    }
  };

  const gererSoumissionContact = (evenement: SyntheticEvent) => {
    evenement.preventDefault();
    if (!nomContact.trim() || !emailContact.trim() || !sujetContact.trim() || !contenuContact.trim()) return;

    // Simulation d'envoi : # A MODIFIER
    definirNotificationContactEnvoye(true);
    setTimeout(() => {
      definirNomContact('');
      definirEmailContact('');
      definirSujetContact('');
      definirContenuContact('');
      definirNotificationContactEnvoye(false);
    }, 4000);
  };

  const executerTransactionDon = (evenement: SyntheticEvent) => {
    evenement.preventDefault();
    if (!donateurNom.trim() || !donateurEmail.trim() || !donNumeroCarte.trim()) return;

    // Simulation de validation paiement
    definirEtapeDonation(2); // étape merci
  };

  const reinitialiserEspaceDon = () => {
    definirMontantDon(50);
    definirEtapeDonation(0);
    definirDonateurNom('');
    definirDonateurEmail('');
    definirDonNumeroCarte('');
  };

  return (
    <section id="contact-dons-screen" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      
      {/* 1. Titre Global */}
      <div className="space-y-4 max-w-3xl">
        <span className="font-mono text-xs uppercase tracking-widest text-[#af894d] dark:text-[#c29f63] block">
          Lorem ipsum dolor
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900 leading-tight dark:text-slate-100">
          Entrer en Contact & Soutenir l’église
        </h1>
        <p className="text-base text-slate-600 font-light dark:text-slate-400">
          Que vous souhaitiez demander un rendez-vous avec le pasteur, un diacre ou un ancien, solliciter une prière d’intercession ou faire un don, vous trouverez ci-dessous les canaux dédiés.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* ================= SECTION A : FORMULAIRE DE CONTACT ================= */}
        <div className="bg-white border border-[#f4ebd9]/60 rounded-xl p-6 sm:p-8 space-y-6 dark:bg-slate-900 dark:border-slate-800">
          <div className="space-y-2 text-left">
            <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
              Formulaire de Contact
            </h2>
            <p className="text-sm text-slate-500 font-light dark:text-slate-400">
              Pour nous contacter, veuillez remplir ce formulaire et expliquer votre requête.
            </p>
          </div>

          <form
            id="formulaire-contact-paroissial"
            onSubmit={gererSoumissionContact}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label htmlFor="nom-expediteur" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Votre Nom & Post-nom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    id="nom-expediteur"
                    required
                    placeholder="Ex : Jean Ilunga"
                    value={nomContact}
                    onChange={(e) => definirNomContact(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded bg-slate-50 border border-slate-200 outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] dark:bg-slate-800 dark:border-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label htmlFor="courriel-expediteur" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Adresse Mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    id="courriel-expediteur"
                    required
                    placeholder="Ex : jeanilunga@gmail.com"
                    value={emailContact}
                    onChange={(e) => definirEmailContact(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded bg-slate-50 border border-slate-200 outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] dark:bg-slate-800 dark:border-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label htmlFor="objet-expediteur" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Objet de la demande
              </label>
              <input
                type="text"
                id="objet-expediteur"
                required
                placeholder="Ex : Communication nécrologique"
                value={sujetContact}
                onChange={(e) => definirSujetContact(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded bg-slate-50 border border-slate-200 outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] dark:bg-slate-800 dark:border-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label htmlFor="corps-message" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Message
              </label>
              <textarea
                id="corps-message"
                required
                rows={5}
                placeholder="Explicitez votre requête ici..."
                value={contenuContact}
                onChange={(e) => definirContenuContact(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded bg-slate-50 border border-slate-200 outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] dark:bg-slate-800 dark:border-slate-800 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              id="bouton-envoi-formulaire-contact"
              className="w-full py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded transition-all hover:bg-[#af894d] flex items-center justify-center gap-2 cursor-pointer dark:bg-slate-800 dark:hover:bg-[#af894d]"
            >
              {notificationContactEnvoye ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Envoyé avec succès !
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Envoyer
                </>
              )}
            </button>
          </form>
        </div>


        {/* ================= SECTION B : INTERACTION DONS / SOUVENIRS ================= */}
        <div className="bg-slate-50 border border-[#f4ebd9] rounded-xl p-6 sm:p-8 space-y-6 flex flex-col justify-between dark:bg-slate-900/40 dark:border-slate-800">
          
          <div className="space-y-5">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-1.5 bg-[#c29f63]/10 text-[#af894d] w-fit px-2.5 py-1 rounded dark:bg-[#c29f63]/15 dark:text-[#c29f63]">
                <Heart className="w-4 h-4 fill-current animate-pulse text-rose-500" />
                <span className="text-[10px] font-mono tracking-wider font-bold uppercase">Lorem ipsum dolor</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
                Dons et lorem ipsum
              </h2>
              <p className="text-sm text-slate-500 font-light dark:text-slate-400">
                Aidez-nous financièrement dans nos œuvres. Ajustez le curseur ci-dessous pour fixer votre montant.
              </p>
            </div>

            {/* CURSEUR SLIDER DE DON */}
            <div className="space-y-4 py-4 bg-white border border-[#f4ebd9]/60 p-5 rounded-xl dark:bg-slate-900 dark:border-slate-850">
              
              {/* Affichage du montant en gros */}
              <div className="flex justify-between items-baseline">
                <span className="text-xs uppercase font-mono tracking-widest text-[#af894d] dark:text-[#c29f63]">Mon don :</span>
                <span id="texte-montant-curseur" className="font-serif text-4xl font-extrabold text-[#af894d] dark:text-[#c29f63]">
                  {montantDon} $
                </span>
              </div>

              {/* Règle de sélection / Slider */}
              <input
                type="range"
                id="barre-choix-montant-offrande"
                min="5"
                max="500"
                step="5"
                value={montantDon}
                onChange={(e) => definirMontantDon(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#af894d] dark:bg-slate-800"
              />

              {/* Raccourcis boutons montants */}
              <div className="flex flex-wrap gap-2 gap-y-2 mt-3">
                {montantsPredefinis.map((somme) => (
                  <button
                    key={somme}
                    id={`bouton-predelete-${somme}`}
                    onClick={() => definirMontantDon(somme)}
                    className={`px-3 py-1.5 rounded font-mono text-xs font-semibold cursor-pointer border transition-all ${
                      montantDon === somme
                        ? 'bg-[#af894d] text-white border-transparent shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-705'
                    }`}
                  >
                    {somme} $
                  </button>
                ))}
              </div>

              {/* EXPLICATION IMPACT DU DON */}
              <div className="pt-4 border-t border-slate-50 dark:border-slate-850 text-left space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500">
                  Votre don :
                </span>
                <p id="phrase-impact-dest-don" className="text-sm text-slate-700 font-light leading-relaxed italic dark:text-slate-350">
                  « {determinerImpactDon(montantDon)} »
                </p>
              </div>

            </div>
          </div>

          <div className="pt-2">
            <button
              id="bouton-soutenir-offrande-etape-suivante"
              onClick={() => definirEtapeDonation(1)}
              className="w-full py-4 rounded bg-[#af894d] hover:bg-[#936f3c] text-white text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Envoyer ({montantDon} $)
            </button>
            <p className="text-[10px] text-center text-slate-400 font-mono mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Accusé de réception envoyé sous 48h.
            </p>
          </div>

        </div>

      </div>

      {/* MODALE D'OFFRANDE AVEC TRANSITIONS CHALEUREUSES */}
      <AnimatePresence>
        {etapeDonation > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950 cursor-pointer"
              onClick={reinitialiserEspaceDon}
            />

            {/* Cadre de la quête */}
            <motion.div
              id="cadre-dialog-offrande"
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-800 z-10 dark:bg-slate-900 dark:text-slate-100"
            >
              {/* Bouton fermeture */}
              <button
                id="bouton-fermer-modale-don"
                onClick={reinitialiserEspaceDon}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer dark:hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              {etapeDonation === 1 && (
                <form id="formulaire-offrande-paiement" onSubmit={executerTransactionDon} className="space-y-5">
                  <div className="space-y-1.5 text-center">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#c29f63] font-bold">
                      Étape 2 / 2 — Transaction & informations
                    </span>
                    <h3 className="font-serif text-2xl font-bold tracking-tight">
                      Soutenir à hauteur de {montantDon} $
                    </h3>
                    <p className="text-xs text-slate-500 font-light dark:text-slate-400 max-w-xs mx-auto">
                      Entrez vos informations pour finaliser la transaction.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.1 text-left">
                      <label htmlFor="donateur-nom" className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                        Votre nom complet
                      </label>
                      <input
                        type="text"
                        id="donateur-nom"
                        required
                        placeholder="Ex : Thérèse Mwadi"
                        value={donateurNom}
                        onChange={(e) => definirDonateurNom(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded bg-slate-50 border border-slate-200 outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] dark:bg-slate-800 dark:border-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="space-y-1.1 text-left">
                      <label htmlFor="donateur-email" className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                        Adresse électronique
                      </label>
                      <input
                        type="email"
                        id="donateur-email"
                        required
                        placeholder="theresemwadi@gmail.com"
                        value={donateurEmail}
                        onChange={(e) => definirDonateurEmail(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded bg-slate-50 border border-[#e7d4b0] outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] dark:bg-slate-800 dark:border-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="space-y-1.1 text-left">
                      <label htmlFor="numero-carte" className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                        Détails de la carte de crédit
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          id="numero-carte"
                          required
                          placeholder="4970 •••• •••• ••••"
                          value={donNumeroCarte}
                          onChange={(e) => definirDonNumeroCarte(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded bg-slate-50 border border-slate-200 outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] dark:bg-slate-800 dark:border-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      id="bouton-soumettre-paiement-final"
                      className="w-full py-3 bg-[#af894d] hover:bg-[#936f3c] text-white font-bold text-xs uppercase tracking-widest rounded-md cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" /> Finaliser la transaction
                    </button>
                  </div>
                </form>
              )}

              {etapeDonation === 2 && (
                <motion.div
                  id="certificat-offrande-grand-merci"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-amber-50 text-[#c29f63] border border-[#c29f63] rounded-full mx-auto flex items-center justify-center shadow-lg dark:bg-[#c29f63]/10">
                    <Award className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#c29f63] font-bold block uppercase">
                      Transaction terminée
                    </span>
                    <h4 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
                      Un Grand Merci à vous !
                    </h4>
                    <p className="text-sm text-slate-600 font-light dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Sr. Élise et toute l'équipe de l'Alliance glorifient votre geste de soutien à hauteur d'un don de <span className="font-extrabold text-[#af894d]">{montantDon} $</span>.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 border border-[#f4ebd9]/80 rounded text-[11px] font-mono text-slate-500 space-y-1 text-left dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400">
                    <div><strong>Donateur :</strong> {donateurNom}</div>
                    <div><strong>Accusé de réception :</strong> Envoyé à {donateurEmail}</div>
                    <div><strong>Destinations :</strong> {determinerImpactDon(montantDon)}</div>
                  </div>

                  <div className="pt-2">
                    <button
                      id="bouton-fermer-certificat-don"
                      onClick={reinitialiserEspaceDon}
                      className="px-6 py-2.5 rounded border border-slate-200 text-slate-600 font-bold text-xs uppercase hover:bg-slate-100 dark:border-slate-850 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Retourner à l’accueil
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
