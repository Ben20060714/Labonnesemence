import React, { useState } from 'react';
import { connecterUtilisateur, enregistrerSessionAuth, UtilisateurAuthentifie } from '../services/auth';

interface LoginPageProps {
    onLoginSuccess: (user: UtilisateurAuthentifie) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const session = await connecterUtilisateur(email, password);
            enregistrerSessionAuth(session);
            onLoginSuccess(session.user);
        } catch (err) {
            console.error('Erreur de connexion:', err);
            setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la connexion.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-900">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md w-full max-w-sm space-y-6">
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100">Connexion</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-[#af894d] focus:border-[#af894d] dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-[#af894d] focus:border-[#af894d] dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#af894d] hover:bg-[#936f3c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#af894d] dark:bg-[#c29f63] dark:hover:bg-[#af894d]">
                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                </button>
            </form>
        </div>
    );
}
