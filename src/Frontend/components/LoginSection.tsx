/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, SyntheticEvent } from 'react';
import { User, Lock, LogIn } from 'lucide-react';
import { connecterUtilisateur, enregistrerSessionAuth, UtilisateurAuthentifie } from '../services/auth';

interface LoginSectionProps {
  redirigerVersPage: (page: string) => void;
  definirUtilisateur: (utilisateur: UtilisateurAuthentifie | null) => void;
}

export default function LoginSection({ redirigerVersPage, definirUtilisateur }: LoginSectionProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await connecterUtilisateur(email, password);
      enregistrerSessionAuth(session);
      definirUtilisateur(session.user);
      redirigerVersPage(session.user.role === 'admin' ? 'administration' : 'mon-compte');
    } catch (erreur) {
      setError(erreur instanceof Error ? erreur.message : 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="login-screen" className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 space-y-8 border border-[#f4ebd9]/60 dark:border-slate-800">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">Connexion</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Connectez-vous à votre compte.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">Adresse Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input id="email" name="email" type="email" autoComplete="email" required className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm placeholder-slate-400 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-[#af894d] focus:border-[#af894d] text-sm" placeholder="Adresse Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input id="password" name="password" type="password" autoComplete="current-password" required className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm placeholder-slate-400 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-[#af894d] focus:border-[#af894d] text-sm" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#af894d] hover:bg-[#936f3c] disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#af894d] transition-colors duration-200">
            {loading ? 'Connexion en cours...' : <><LogIn className="w-4 h-4 mr-2" /> Se connecter</>}
          </button>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            Vous n'avez pas de compte ?{' '}
            <button type="button" onClick={() => redirigerVersPage('inscription')} className="text-[#af894d] hover:underline cursor-pointer">
              Créez-en un
            </button>
          </p>
        </form>
      </div>
    </section>
  );
}
