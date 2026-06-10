/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, SyntheticEvent } from 'react';
import { Lock, Mail, UserPlus, UserRound } from 'lucide-react';
import { enregistrerSessionAuth, inscrireUtilisateur } from '../services/auth';

interface InscriptionSectionProps {
  redirigerVersPage: (page: string) => void;
}

export default function InscriptionSection({ redirigerVersPage }: InscriptionSectionProps) {
  const [nom, setNom] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmationPassword, setConfirmationPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInscription = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (password !== confirmationPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const session = await inscrireUtilisateur(nom.trim(), email.trim(), password);
      enregistrerSessionAuth(session);
      redirigerVersPage('administration');
    } catch (erreur) {
      setError(erreur instanceof Error ? erreur.message : 'Inscription impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="inscription-screen" className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 space-y-8 border border-[#f4ebd9]/60 dark:border-slate-800">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">Inscription</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Créez votre compte pour accéder à votre espace.</p>
        </div>
        <form onSubmit={handleInscription} className="space-y-6">
          <div>
            <label htmlFor="nom-inscription" className="sr-only">Nom complet</label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input id="nom-inscription" name="nom" type="text" autoComplete="username" minLength={3} maxLength={30} required className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm placeholder-slate-400 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-[#af894d] focus:border-[#af894d] text-sm" placeholder="Nom d'utilisateur" value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="email-inscription" className="sr-only">Adresse Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input id="email-inscription" name="email" type="email" autoComplete="email" required className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm placeholder-slate-400 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-[#af894d] focus:border-[#af894d] text-sm" placeholder="Adresse Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="password-inscription" className="sr-only">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input id="password-inscription" name="password" type="password" autoComplete="new-password" minLength={8} required className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm placeholder-slate-400 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-[#af894d] focus:border-[#af894d] text-sm" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="confirmation-password-inscription" className="sr-only">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input id="confirmation-password-inscription" name="confirmationPassword" type="password" autoComplete="new-password" minLength={8} required className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm placeholder-slate-400 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-[#af894d] focus:border-[#af894d] text-sm" placeholder="Confirmer le mot de passe" value={confirmationPassword} onChange={(e) => setConfirmationPassword(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#af894d] hover:bg-[#936f3c] disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#af894d] transition-colors duration-200">
            {loading ? 'Inscription en cours...' : <><UserPlus className="w-4 h-4 mr-2" /> S'inscrire</>}
          </button>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            Vous avez déjà un compte ?{' '}
            <button type="button" onClick={() => redirigerVersPage('login')} className="text-[#af894d] hover:underline cursor-pointer">
              Connectez-vous
            </button>
          </p>
        </form>
      </div>
    </section>
  );
}
