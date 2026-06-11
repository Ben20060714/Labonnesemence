/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, SyntheticEvent, useEffect } from 'react';
import { Mail, ShieldCheck, Heart, User, Check, Send, Award, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api, DonationBackend, MonetbilConfig } from '../services/api';

export default function ContactDonsSection() {
  // Regroupement des états du formulaire pour une gestion plus fluide
  const [formulaireContact, definirFormulaireContact] = useState({
    nom: '',
    email: '',
    sujet: '',
    contenu: ''
  });
  const [notificationContactEnvoye, definirNotificationContactEnvoye] = useState<boolean>(false);
  const [contactEnvoiEnCours, definirContactEnvoiEnCours] = useState<boolean>(false);
  const [erreurContact, definirErreurContact] = useState<string | null>(null);

  // États Section Dons
  const [montantDon, definirMontantDon] = useState<number>(50);
  const [etapeDonation, definirEtapeDonation] = useState<number>(0); // 0: choix, 1: transaction, 2: merci
  const [donateurNom, definirDonateurNom] = useState<string>('');
  const [donateurEmail, definirDonateurEmail] = useState<string>('');
  const [donateurTelephone, definirDonateurTelephone] = useState<string>('+243850000'); // Numéro provisoire
  const [configurationMonetbil, definirConfigurationMonetbil] = useState<MonetbilConfig | null>(null);
  const [donationPreparee, definirDonationPreparee] = useState<DonationBackend | null>(null);
  const [donPreparationEnCours, definirDonPreparationEnCours] = useState<boolean>(false);
  const [erreurDon, definirErreurDon] = useState<string | null>(null);

  const montantsPredefinis = [15, 30, 50, 100, 250, 500];

  // Dynamically load Monetbil script
  useEffect(() => {
    const scriptId = 'monetbil-widget-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = 'https://fr.monetbil.com/widget/v2/monetbil.min.js';
      script.async = true;
      document.body.appendChild(script);
    }

    api.obtenirConfigurationMonetbil()
      .then(definirConfigurationMonetbil)
      .catch((erreur) => {
        console.error('Configuration Monetbil indisponible:', erreur);
        definirErreurDon("Le paiement n'est pas disponible pour le moment.");
      });

    // Écouteur pour les événements du widget Monetbil v2
    const gererMessageMonetbil = (event: MessageEvent) => {
      // Le widget Monetbil v2 envoie des objets via postMessage
      if (event.data && event.data.name) {
        if (event.data.name === 'monetbil.payment.success') {
          definirEtapeDonation(2);
        } else if (event.data.name === 'monetbil.payment.error') {
          console.error("Erreur de transaction Monetbil :", event.data);
          definirErreurDon("Le paiement a échoué. Veuillez réessayer.");
        }
      }
    };

    window.addEventListener('message', gererMessageMonetbil);
    return () => window.removeEventListener('message', gererMessageMonetbil);
  }, []);

  // Extraction de la logique d'impact
  const determinerImpactDon = (somme: number): string => {
    if (somme <= 20) return 'Peut contribuer à l’achat d’ornements de l’église et des besoins de l’école de dimanche.';
    if (somme <= 40) return 'Peut financer du matériel créatif pour les enfants de l’école de dimanche.';
    if (somme <= 75) return 'Peut financer les vivres distribués lors de nos visites aux démunis mais aussi booster la structure de l’église.';
    if (somme <= 250) return 'Peut soutenir activement les comités de l’église et le financement des sorties culturelles ou de détente.';
    return 'Contribue directement aux réparations de notre église et à l’entretien technique des autres secteurs défectueux.';
  };

  // Gestionnaire de changement unique
  const gererChangementChamp = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const correspondance: Record<string, string> = {
      'nom-expediteur': 'nom',
      'courriel-expediteur': 'email',
      'objet-expediteur': 'sujet',
      'corps-message': 'contenu'
    };
    if (correspondance[id]) {
      definirFormulaireContact(prev => ({ ...prev, [correspondance[id]]: value }));
    }
  };

  const gererSoumissionContact = async (evenement: SyntheticEvent) => {
    evenement.preventDefault();
    const { nom, email, sujet, contenu } = formulaireContact;
    if (!nom.trim() || !email.trim() || !sujet.trim() || !contenu.trim()) return;

    definirContactEnvoiEnCours(true);
    definirErreurContact(null);

    try {
      await api.envoyerMessageContact({
        nom: nom.trim(),
        email: email.trim(),
        sujet: sujet.trim(),
        contenu: contenu.trim()
      });
      definirNotificationContactEnvoye(true);
      definirFormulaireContact({ nom: '', email: '', sujet: '', contenu: '' });
      setTimeout(() => definirNotificationContactEnvoye(false), 4000);
    } catch (erreur) {
      definirErreurContact(erreur instanceof Error ? erreur.message : "Impossible d'envoyer le message.");
    } finally {
      definirContactEnvoiEnCours(false);
    }
  };

  const preparerTransactionMonetbil = async (evenement: SyntheticEvent) => {
    evenement.preventDefault();
    if (!donateurNom.trim() || !donateurEmail.trim() || !donateurTelephone.trim()) return;

    definirDonPreparationEnCours(true);
    definirErreurDon(null);

    try {
      const donation = await api.preparerDonation({
        donorName: donateurNom.trim(),
        donorEmail: donateurEmail.trim(),
        donorPhone: donateurTelephone.trim(),
        amount: montantDon,
        designation: 'Don CABCS',
        description: determinerImpactDon(montantDon),
      });

      definirDonationPreparee(donation);
    } catch (erreur) {
      definirErreurDon(erreur instanceof Error ? erreur.message : 'Impossible de préparer le paiement.');
    } finally {
      definirDonPreparationEnCours(false);
    }
  };

  const reinitialiserEspaceDon = () => {
    definirMontantDon(50);
    definirEtapeDonation(0);
    definirDonateurNom('');
    definirDonateurEmail('');
    definirDonateurTelephone(''); // Reset phone number
    definirDonationPreparee(null);
    definirErreurDon(null);
  };

  const construireUrlPaiementMonetbil = () => {
    if (!configurationMonetbil || !donationPreparee) return '#';

    const params = new URLSearchParams({
      service: configurationMonetbil.serviceKey,
      service_key: configurationMonetbil.serviceKey,
      amount: String(donationPreparee.amount),
      currency: donationPreparee.currency,
      reference: donationPreparee.reference,
      item_ref: donationPreparee.reference,
      item_name: 'Don solidaire',
      item_type: 'SOCIAL',
      designation: donationPreparee.designation,
      description: donationPreparee.description || determinerImpactDon(montantDon),
      phone: donationPreparee.donor_phone,
      customer_name: donationPreparee.donor_name,
      customer_email: donationPreparee.donor_email,
      notify_url: configurationMonetbil.notifyUrl,
      return_url: configurationMonetbil.returnUrl,
      cancel_url: configurationMonetbil.cancelUrl,
    });

    return `${configurationMonetbil.paymentUrl}?${params.toString()}`;
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
                  <input type="text" id="nom-expediteur" required placeholder="Ex : Jean Ilunga" value={formulaireContact.nom} onChange={gererChangementChamp} className="w-full pl-9 pr-4 py-2.5 text-sm rounded bg-slate-50 border border-slate-200 outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] dark:bg-slate-800 dark:border-slate-800 dark:text-slate-100"/>
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
                    value={formulaireContact.email}
                    onChange={gererChangementChamp}
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
                value={formulaireContact.sujet}
                onChange={gererChangementChamp}
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
                value={formulaireContact.contenu}
                onChange={gererChangementChamp}
                className="w-full px-4 py-2.5 text-sm rounded bg-slate-50 border border-slate-200 outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] dark:bg-slate-800 dark:border-slate-800 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              id="bouton-envoi-formulaire-contact"
              disabled={contactEnvoiEnCours}
              className="w-full py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded transition-all hover:bg-[#af894d] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed dark:bg-slate-800 dark:hover:bg-[#af894d]"
            >
              {contactEnvoiEnCours ? (
                <>
                  <Send className="w-3.5 h-3.5" /> Envoi en cours...
                </>
              ) : notificationContactEnvoye ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Envoyé avec succès !
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Envoyer
                </>
              )}
            </button>
            {erreurContact && (
              <p className="text-sm text-red-500 text-center">{erreurContact}</p>
            )}
          </form>
        </div>


        {/* ================= SECTION B : INTERACTION DONS ================= */}
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

              {/* Monetbil Payment Form */}
              {etapeDonation === 1 && !donationPreparee && (
                <form
                  id="formulaire-offrande-paiement-monetbil"
                  onSubmit={preparerTransactionMonetbil}
                  className="space-y-5"
                >
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
                        data-monetbil-customer-name={donateurNom}
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
                        data-monetbil-customer-email={donateurEmail}
                        onChange={(e) => definirDonateurEmail(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded bg-slate-50 border border-[#e7d4b0] outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] dark:bg-slate-800 dark:border-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div className="space-y-1.1 text-left">
                      <label htmlFor="donateur-telephone" className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                        Numéro de téléphone (Mobile Money)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="tel"
                          id="donateur-telephone"
                          required
                          placeholder="+243 ..."
                          value={donateurTelephone}
                          onChange={(e) => definirDonateurTelephone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded bg-slate-50 border border-slate-200 outline-none focus:border-[#af894d] focus:ring-1 focus:ring-[#af894d] dark:bg-slate-800 dark:border-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      id="bouton-preparer-paiement-final"
                      disabled={donPreparationEnCours || !configurationMonetbil}
                      className="w-full py-3 bg-[#af894d] hover:bg-[#936f3c] text-white font-bold text-xs uppercase tracking-widest rounded-md cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {donPreparationEnCours ? 'Préparation...' : 'Préparer le paiement'}
                    </button>
                  </div>
                </form>
              )}

              {etapeDonation === 1 && donationPreparee && configurationMonetbil && (
                <form
                  id="formulaire-monetbil-widget"
                  className="space-y-4"
                  action={configurationMonetbil.paymentUrl}
                  method="POST"
                  target="_blank"
                  data-monetbil="form"
                  data-monetbil-service-key={configurationMonetbil.serviceKey}
                  data-monetbil-amount={donationPreparee.amount}
                  data-monetbil-currency={donationPreparee.currency}
                  data-monetbil-reference={donationPreparee.reference}
                  data-monetbil-item-ref={donationPreparee.reference}
                  data-monetbil-designation={donationPreparee.designation}
                  data-monetbil-item-name="Don solidaire"
                  data-monetbil-item-type="SOCIAL"
                  data-monetbil-description={donationPreparee.description || determinerImpactDon(montantDon)}
                  data-monetbil-phone={donationPreparee.donor_phone}
                  data-monetbil-customer-name={donationPreparee.donor_name}
                  data-monetbil-customer-email={donationPreparee.donor_email}
                  data-monetbil-notify-url={configurationMonetbil.notifyUrl}
                  data-monetbil-return-url={configurationMonetbil.returnUrl}
                  data-monetbil-cancel-url={configurationMonetbil.cancelUrl}
                >
                  <input type="hidden" name="service" value={configurationMonetbil.serviceKey} />
                  <input type="hidden" name="service_key" value={configurationMonetbil.serviceKey} />
                  <input type="hidden" name="amount" value={donationPreparee.amount} />
                  <input type="hidden" name="currency" value={donationPreparee.currency} />
                  <input type="hidden" name="reference" value={donationPreparee.reference} />
                  <input type="hidden" name="item_ref" value={donationPreparee.reference} />
                  <input type="hidden" name="item_name" value="Don solidaire" />
                  <input type="hidden" name="item_type" value="SOCIAL" />
                  <input type="hidden" name="designation" value={donationPreparee.designation} />
                  <input type="hidden" name="description" value={donationPreparee.description || determinerImpactDon(montantDon)} />
                  <input type="hidden" name="phone" value={donationPreparee.donor_phone} />
                  <input type="hidden" name="customer_name" value={donationPreparee.donor_name} />
                  <input type="hidden" name="customer_email" value={donationPreparee.donor_email} />
                  <input type="hidden" name="notify_url" value={configurationMonetbil.notifyUrl} />
                  <input type="hidden" name="return_url" value={configurationMonetbil.returnUrl} />
                  <input type="hidden" name="cancel_url" value={configurationMonetbil.cancelUrl} />
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800 space-y-1">
                    <p className="font-bold">Paiement préparé</p>
                    <p className="font-mono text-[11px] break-all">Référence : {donationPreparee.reference}</p>
                  </div>
                  <button
                    type="submit"
                    id="bouton-soumettre-paiement-final"
                    className="w-full py-3 bg-[#af894d] hover:bg-[#936f3c] text-white font-bold text-xs uppercase tracking-widest rounded-md cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Ouvrir Monetbil
                  </button>
                  <a
                    href={construireUrlPaiementMonetbil()}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-xs font-semibold text-[#af894d] hover:underline"
                  >
                    Ouvrir la page de paiement dans un nouvel onglet
                  </a>
                </form>
              )}

              {erreurDon && (
                <p className="text-sm text-red-500 text-center">{erreurDon}</p>
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
                    <div><strong>Téléphone :</strong> {donateurTelephone}</div>
                    {donationPreparee && <div><strong>Référence :</strong> {donationPreparee.reference}</div>}
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
