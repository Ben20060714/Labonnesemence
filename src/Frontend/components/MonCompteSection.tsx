import { useEffect, useState } from 'react';
import { LogOut, Mail, Shield, UserRound } from 'lucide-react';
import { effacerSessionAuth, obtenirUtilisateurCourant, UtilisateurAuthentifie } from '../services/auth';

interface MonCompteSectionProps {
  utilisateurInitial: UtilisateurAuthentifie | null;
  definirUtilisateur: (utilisateur: UtilisateurAuthentifie | null) => void;
  redirigerVersPage: (page: string) => void;
}

export default function MonCompteSection({
  utilisateurInitial,
  definirUtilisateur,
  redirigerVersPage,
}: MonCompteSectionProps) {
  const [utilisateur, setUtilisateur] = useState<UtilisateurAuthentifie | null>(utilisateurInitial);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let composantActif = true;

    obtenirUtilisateurCourant()
      .then((utilisateurServeur) => {
        if (!composantActif) return;
        setUtilisateur(utilisateurServeur);
        definirUtilisateur(utilisateurServeur);
        if (!utilisateurServeur) redirigerVersPage('login');
      })
      .finally(() => {
        if (composantActif) setChargement(false);
      });

    return () => {
      composantActif = false;
    };
  }, [definirUtilisateur, redirigerVersPage]);

  const seDeconnecter = () => {
    effacerSessionAuth();
    definirUtilisateur(null);
    redirigerVersPage('login');
  };

  if (chargement) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-sm text-slate-500">Chargement du compte...</p>
      </section>
    );
  }

  if (!utilisateur) return null;

  return (
    <section id="mon-compte-screen" className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#f4ebd9] dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[#f4ebd9] dark:border-slate-800">
          <span className="font-mono text-xs uppercase tracking-widest text-[#af894d] dark:text-[#c29f63]">
            Espace personnel
          </span>
          <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
            Mon compte
          </h1>
        </div>

        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
            <UserRound className="w-5 h-5 text-[#af894d] mb-3" />
            <p className="text-xs uppercase font-mono text-slate-400">Nom utilisateur</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{utilisateur.username}</p>
          </div>

          <div className="p-5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
            <Mail className="w-5 h-5 text-[#af894d] mb-3" />
            <p className="text-xs uppercase font-mono text-slate-400">Email</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100 break-all">{utilisateur.email}</p>
          </div>

          <div className="p-5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
            <Shield className="w-5 h-5 text-[#af894d] mb-3" />
            <p className="text-xs uppercase font-mono text-slate-400">Role</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{utilisateur.role}</p>
          </div>

          <div className="p-5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
            <p className="text-xs uppercase font-mono text-slate-400">Compte cree le</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {new Date(utilisateur.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="px-8 pb-8">
          <button
            type="button"
            onClick={seDeconnecter}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-[#af894d] transition-all cursor-pointer dark:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            Deconnexion
          </button>
        </div>
      </div>
    </section>
  );
}
